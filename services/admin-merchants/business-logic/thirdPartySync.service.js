var AWS = require('aws-sdk');
var qs = require('querystring');
const axios = require('axios');
let _ = require('lodash');

var ssm = new AWS.SSM({ region: process.env.REGION });
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
var { sendEmail, models } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');

const {
    MerchantRepo,
    ResellerRepo,
    BusinessDetailRepo,
    RelationshipRepo,
    UserRoleRepo,
    UserRepo,
    AddressRepo,
    BusinessTypeRepo
} = require('../../../libs/repo');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);
const merchantRepo = new MerchantRepo(db);
const resellerRepo = new ResellerRepo(db);
const businessDetailRepo = new BusinessDetailRepo(db);
const relationshipRepo = new RelationshipRepo(db);
const userRoleRepo = new UserRoleRepo(db);
const userRepo = new UserRepo(db);
const addressRepo = new AddressRepo(db);
const businessTypeRepo = new BusinessTypeRepo(db);

const { Op } = db.Sequelize;

export class ThirdPartySyncService {
    async execute() {
        console.log('Initiating Zoho Sync');
        let zohoCrmConnectionDetails = await this.getSsmParameter({
            Name: `/cp/${process.env.INFRA_STAGE}/cp/ZohoCRM`
        });

        if (!zohoCrmConnectionDetails) {
            console.log('Skipping sync because zohoCrm Connection Details are not there');
            return;
        }

        console.log(zohoCrmConnectionDetails);

        zohoCrmConnectionDetails = JSON.parse(zohoCrmConnectionDetails);

        if (!zohoCrmConnectionDetails.enabled) {
            console.log('Skipping sync because zohoCrm Connection Details have sync as disabled');
            return;
        }

        zohoCrmConnectionDetails = await this.populateActiveZohoAccessToken(
            { Name: `/cp/${process.env.INFRA_STAGE}/cp/ZohoCRM` },
            zohoCrmConnectionDetails
        );

        if (!zohoCrmConnectionDetails.access_token) {
            console.log('Skipping sync because zohoCrmConnectionDetails access_token is not there');
            return;
        }

        //Upsert records to Zoho accounts, and keep updating lastZohoAccountsSyncAt for tracking
        let merchantDetailsToSync = await this.getMerchantsDetailsForZohoSync(zohoCrmConnectionDetails);

        if (zohoCrmConnectionDetails.debug) {
            console.log('merchantDetailsToSync', merchantDetailsToSync);
        }

        let syncConcurrency = zohoCrmConnectionDetails.syncConcurrency;
        let pagesToSync = Math.ceil(merchantDetailsToSync.accounts.length / syncConcurrency);
        let remainingMerchantsToSync = JSON.parse(JSON.stringify(merchantDetailsToSync.accounts));
        for (let i = 0; i < pagesToSync; i++) {
            let merchantsBeingSynced = remainingMerchantsToSync.splice(0, syncConcurrency);
            let syncResult = await this.syncZohoMerchantsAccounts(zohoCrmConnectionDetails, merchantsBeingSynced);
            if (syncResult.isSyncSuccessful) {
                await this.markMerchantsAsSyncedToZoho(merchantsBeingSynced);
            } else {
                await this.sendZohoCRMSyncFailureEMail(zohoCrmConnectionDetails, merchantsBeingSynced);
            }
        }
    }
    async getSsmParameter(options) {
        try {
            let res = await ssm.getParameter(options).promise();
            return res?.Parameter?.Value;
        } catch (ex) {
            console.log('Something went wrong while fetching SSM parameter', ex, 'Options were', options);
        }
    }
    async populateActiveZohoAccessToken(ssmParams, zohoCrmConnectionDetails) {
        //If we already have an access token then check whether if it works
        if (zohoCrmConnectionDetails.access_token) {
            let doesCurrentAccessTokenWork = await this.isZohoAccessTokenActive(zohoCrmConnectionDetails);
            //If it works then alright, just return, no need to do any fancy stuff;
            if (doesCurrentAccessTokenWork) {
                return zohoCrmConnectionDetails;
            }
        }

        //Now that we know that either the current access token is messed up or doesn't exist
        //If we have a refresh token then get the access token using refresh token
        if (zohoCrmConnectionDetails.refresh_token) {
            zohoCrmConnectionDetails = await this.populateZohoAccessTokenUsingRefreshToken(zohoCrmConnectionDetails);
            //If it still contains access_token then great. That means out refresh token works still
            if (zohoCrmConnectionDetails.access_token) {
                //Populate these new details to ssm and return zohoCrmConnectionDetails
                this.updateZohoTokenDetailsToSsm(ssmParams, zohoCrmConnectionDetails);
                return zohoCrmConnectionDetails;
            }
        }

        if (zohoCrmConnectionDetails.code) {
            //Shit, things are so messed up that we need code to generate refresh token
            // Call getZohoRefreshTokenDetails and see if we get data
            //Remove older refresh token, as we will populate new one
            zohoCrmConnectionDetails = await this.getZohoRefreshTokenUsingCode(zohoCrmConnectionDetails);
            if (zohoCrmConnectionDetails.access_token) {
                //Woo-hoo we got the access_token. Got saved. Update to ssm
                await this.updateZohoTokenDetailsToSsm(ssmParams, zohoCrmConnectionDetails);
            } else {
                //Things messed up really bad. Requires intervention of a human being to update code
                //Send the email to concerned people that it had stopped working
                await this.sendZohoCRMAuthenticationFailureEmail(zohoCrmConnectionDetails);
            }
        }
        return zohoCrmConnectionDetails;
    }
    async getZohoRefreshTokenUsingCode(zohoCrmConnectionDetails) {
        try {
            let res = await axios.post(
                `${zohoCrmConnectionDetails['accounts_url']}/oauth/v2/token`,
                qs.stringify({
                    grant_type: 'authorization_code',
                    client_id: zohoCrmConnectionDetails.client_id,
                    client_secret: zohoCrmConnectionDetails.client_secret,
                    code: zohoCrmConnectionDetails.code
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            if (zohoCrmConnectionDetails.debug) {
                console.log('getZohoRefreshTokenUsingCode data: ', res.data);
            }

            if (res?.data?.error) {
                throw new Error(res.data.error);
            }
            if (res?.status == 200 && res?.data?.access_token) {
                return Object.assign({}, zohoCrmConnectionDetails, res.data);
            }
        } catch (ex) {
            console.log('Something went wrong while fetching zoho referesh token using code', ex);
        }
        return zohoCrmConnectionDetails;
    }

    async updateZohoTokenDetailsToSsm(ssmParams, zohoCrmConnectionDetails) {
        try {
            let res = await ssm
                .putParameter({
                    Name: ssmParams.Name,
                    Type: 'String',
                    Value: JSON.stringify(zohoCrmConnectionDetails),
                    Overwrite: true
                })
                .promise();
            if (zohoCrmConnectionDetails.debug) {
                console.log('Updated Zoho SSM: ', res);
            }
        } catch (ex) {
            console.log(
                'Something went wrong while putting SSM parameter',
                ex,
                'zohoCrmConnectionDetails: ',
                zohoCrmConnectionDetails
            );
        }
    }

    async isZohoAccessTokenActive(zohoCrmConnectionDetails) {
        try {
            let res = await axios.get(`${zohoCrmConnectionDetails.api_domain}/crm/v2/org`, {
                headers: {
                    Authorization: `Zoho-oauthtoken ${zohoCrmConnectionDetails.access_token}`
                }
            });
            if (zohoCrmConnectionDetails.debug) {
                console.log('isZohoAccessTokenActive Get Org details data: ', res.data);
            }

            if (res?.data?.error) {
                throw new Error(res.data.error);
            }
            if (res?.status == 200 && res?.data?.org) {
                return true;
            }
        } catch (ex) {
            console.log('Something went wrong while fetching zoho referesh token', ex);
        }
        return false;
    }

    async populateZohoAccessTokenUsingRefreshToken(zohoCrmConnectionDetails) {
        delete zohoCrmConnectionDetails.access_token;
        try {
            let res = await axios.post(
                `${zohoCrmConnectionDetails['accounts_url']}/oauth/v2/token`,
                qs.stringify({
                    grant_type: 'refresh_token',
                    client_id: zohoCrmConnectionDetails.client_id,
                    client_secret: zohoCrmConnectionDetails.client_secret,
                    refresh_token: zohoCrmConnectionDetails.refresh_token
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );
            if (zohoCrmConnectionDetails.debug) {
                console.log('populateZohoAccessTokenUsingRefreshToken data: ', res.data);
            }

            if (res?.data?.error) {
                throw new Error(res.data.error);
            }
            if (res?.status == 200 && res?.data?.access_token) {
                return Object.assign({}, zohoCrmConnectionDetails, res.data);
            }
        } catch (ex) {
            console.log('Something went wrong while fetching zoho access token using referesh token', ex);
        }
        return zohoCrmConnectionDetails;
    }

    async getMerchantsDetailsForZohoSync(zohoCrmConnectionDetails) {
        let merchantIdsToSync = [];
        let merchants;
        let neededMerchantAttributes = ['id', 'name', 'baseAddressId', 'legalName', 'status', 'businessDetailId'];
        if (zohoCrmConnectionDetails.merchantIdsToSync?.length) {
            merchantIdsToSync = zohoCrmConnectionDetails.merchantIdsToSync;
            merchants = await merchantRepo.findAll({
                where: { id: { [Op.in]: merchantIdsToSync } },
                attributes: neededMerchantAttributes,
                limit: zohoCrmConnectionDetails.merchantFetchLimit
            });
        } else {
            //Fetch merchants which are having updated date > last_zoho_accounts_sync_at
            merchants = await merchantRepo.findAll({
                where: {
                    [Op.or]: [
                        { last_zoho_accounts_sync_at: null },
                        { updated_at: { [Op.gt]: db.sequelize.col('last_zoho_accounts_sync_at') } }
                    ]
                },
                attributes: neededMerchantAttributes,
                limit: zohoCrmConnectionDetails.merchantFetchLimit
            });
        }

        let accounts = await this.getFormattedMerchantsForZohoAccountsSync(merchants);
        return { accounts };
    }

    async syncZohoMerchantsAccounts(zohoCrmConnectionDetails, accounts) {
        try {
            let res = await axios.post(
                `${zohoCrmConnectionDetails['api_domain']}/crm/v2/Accounts/upsert`,
                JSON.stringify({
                    data: accounts,
                    duplicate_check_fields: ['Merchent_ID'] //Zoho has Merchent_ID as sys_ref, :(
                }),
                {
                    headers: {
                        Authorization: `Zoho-oauthtoken ${zohoCrmConnectionDetails.access_token}`
                    }
                }
            );
            if (zohoCrmConnectionDetails.debug) {
                console.log('syncZohoMerchantsAccounts data: ', res?.status, res?.data);
            }

            if (res?.data?.error) {
                throw new Error(res.data.error);
            }
            if (res?.status == 200 && res?.data?.data) {
                let anyRecordFailed = !_.isEmpty(_.without(_.map(res.data.data, 'code'), 'SUCCESS'));
                return { isSyncSuccessful: !anyRecordFailed };
            }
        } catch (ex) {
            console.log('Something went wrong in call to syncZohoMerchantsAccounts', ex);
        }
        return { isSyncSuccessful: false };
    }

    async markMerchantsAsSyncedToZoho(merchantsBeingSynced) {
        let merchantIds = merchantsBeingSynced.map((merchant) => merchant['Merchent_ID']); //Zoho has Merchent_ID as sys_ref, :(
        await merchantRepo.bulkUpdate(
            { lastZohoAccountsSyncAt: new Date() },
            {
                where: { id: { [Op.in]: merchantIds } },
                silent: true
            }
        );
    }
    async getFormattedMerchantsForZohoAccountsSync(merchants = []) {
        const MerchantStatusLabelMap = {
            0: 'Not Submitted',
            1: 'Pending',
            2: 'Verified',
            3: 'Active',
            4: 'Closed',
            5: 'Rejected',
            6: 'Pending Stripe',
            12: 'Watch List'
        };

        let merchantOwnerMap = {};
        let businessDetailsMap = {};
        let baseAddressMap = {};

        let businessDetailsIds = [];
        let merchantIds = [];
        let baseAddressIds = [];

        const ownerRole = await userRoleRepo.findOne({
            where: {
                name: models.UserRole.OWNER
            }
        });

        const businessTypes = await businessTypeRepo.findAll({});

        _.each(merchants, (merchant) => {
            if (merchant.businessDetailId) {
                businessDetailsIds.push(merchant.businessDetailId);
            }
            if (merchant.baseAddressId) {
                baseAddressIds.push(merchant.baseAddressId);
            }

            merchantIds.push(merchant.id);
        });

        //For faster access, populate maps

        if (!_.isEmpty(businessDetailsIds)) {
            let businessDetails = await businessDetailRepo.findAll({ where: { id: { [Op.in]: businessDetailsIds } } });
            _.each(businessDetails, (businessDetail) => {
                businessDetailsMap[businessDetail['id']] = businessDetail;
            });
        }

        if (!_.isEmpty(baseAddressIds)) {
            let baseAddresses = await addressRepo.findAll({ where: { id: { [Op.in]: baseAddressIds } } });
            _.each(baseAddresses, (baseAddress) => {
                baseAddressMap[baseAddress['id']] = baseAddress;
            });
        }

        if (!_.isEmpty(merchants)) {
            let relationships = await relationshipRepo.findAll({
                where: { userId: { [Op.ne]: null }, merchantId: { [Op.in]: merchantIds }, roleId: ownerRole.id }
            });

            let userIds = _.map(relationships, 'userId');
            let usersMap = {};
            let users = !_.isEmpty(userIds) && (await userRepo.findAll({ where: { id: { [Op.in]: userIds } } }));
            _.each(users, (user) => {
                usersMap[user.id] = user;
            });

            _.each(relationships, (ownerRelationship) => {
                merchantOwnerMap[ownerRelationship.merchantId] = usersMap[ownerRelationship.userId];
            });
        }

        //Enable for debugging
        // console.log(businessDetailsMap);
        // console.log(baseAddressMap);
        // console.log(merchantOwnerMap);

        return merchants.map((merchant) => {
            let businessDetail = businessDetailsMap[merchant.businessDetailId];
            let baseAddress = baseAddressMap[merchant.baseAddressId];

            let owner = merchantOwnerMap[merchant.id];
            let businessType = _.find(businessTypes, { id: businessDetail?.business_type_id || 1 }); //By default Limited
            //Get data from respective maps and return
            return {
                Account_Name: merchant.name || '',
                Merchent_ID: merchant.id, //Zoho has Merchent_ID as sys_ref, :(
                Legal_Name: merchant.legalName || '',
                Trading_Name: businessDetailsMap[merchant.businessDetailId]?.tradingName || '',
                Status: MerchantStatusLabelMap[merchant.status],
                Email: owner?.email || '',
                Phone: owner?.phoneNumber || '',
                Business_Post_Code: baseAddress?.postCode || '',
                Business_City: baseAddress?.city || '',
                Business_address: _.compact([baseAddress?.addressLine1, baseAddress?.addressLine2]).join(', ') || '',
                Account_Owner_Name: _.compact([owner?.firstName, owner?.lastName]).join(' ') || '',
                Business_Type: businessType?.name || ''
            };
        });
    }
    async sendZohoCRMAuthenticationFailureEmail(zohoCrmConnectionDetails) {
        try {
            //Get Datman Reseller branding
            const reseller = await resellerRepo.findOne({ where: { id: 2 } });

            const resellerBrandingObj = {
                resellerLogo: reseller.logo,
                resellerContactUsPage: reseller.contactUsPageURL,
                portalURL: reseller.portalURL,
                resellerName: reseller.name,
                email: reseller.suportEmail,
                termAndCondPageUrl: reseller.termAndCondPageUrl,
                supportTelNo: reseller.supportTelNo,
                brandingURL: reseller.brandingURL,
                senderEmail: reseller.senderEmail,
                website: reseller.website,
                address: reseller.address
            };

            await sendEmail({
                email: zohoCrmConnectionDetails.emailsToAlert,
                subject: 'Urgent: Zoho CRM Authentication has Failed. Please fix it',
                message: `
                Zoho CRM authentication has failed. Please fix it. <br><br>
                Refer to https://datman.atlassian.net/wiki/spaces/AM/pages/1764720645/Zoho+CRM+Sync+Guide
            `,
                resellerBrandingObj
            });
        } catch (ex) {
            console.log("Tried to send an email about Zoho Auth failure but couldn't. Ex: ", ex);
        }
    }
    async sendZohoCRMSyncFailureEMail(zohoCrmConnectionDetails, merchantsBeingSynced) {
        try {
            //Get Datman Reseller branding
            const reseller = await resellerRepo.findOne({ where: { id: 2 } });

            const resellerBrandingObj = {
                resellerLogo: reseller.logo,
                resellerContactUsPage: reseller.contactUsPageURL,
                portalURL: reseller.portalURL,
                resellerName: reseller.name,
                email: reseller.suportEmail,
                termAndCondPageUrl: reseller.termAndCondPageUrl,
                supportTelNo: reseller.supportTelNo,
                brandingURL: reseller.brandingURL,
                senderEmail: reseller.senderEmail,
                website: reseller.website,
                address: reseller.address
            };

            await sendEmail({
                email: zohoCrmConnectionDetails.emailsToAlert,
                subject: 'Urgent: Zoho CRM Account Sync failed for few merchants',
                message: `
                    Zoho CRM Account Sync has failed for few merchants. Please find the details below:<br> 
                    ${JSON.stringify(merchantsBeingSynced, null, 2)}
                `,
                resellerBrandingObj
            });
        } catch (ex) {
            console.log("Tried to send an email about Zoho Sync failure but couldn't. Ex: ", ex);
        }
    }
}
