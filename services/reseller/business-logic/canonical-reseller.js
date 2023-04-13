var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
var {
    sendEmail,
    createUserWithTemporaryPassword,
    canonicalResellerAccountSignupEmail,
    CanonicalResellerStatus
} = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');

var _ = require('lodash');

const {
    ResellerRepo,
    UserRepo,
    CanonicalResellerRepo,
    UserCanonicalResellerMapRepo,
    AddressRepo,
    UserRoleRepo,
    RelationshipRepo,
    TermsAndConditionsMapRepo,
    MerchantRepo,
    PaymentsConfigurationRepo,
    MerchantProductRequiredRepo,
    MerchantBusinessDescriptionRepo
} = require('../../../libs/repo');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);
const { Op } = db.Sequelize;
const resellerRepo = new ResellerRepo(db);
const userRepo = new UserRepo(db);
const addressRepo = new AddressRepo(db);
const canonicalResellerRepo = new CanonicalResellerRepo(db);
const userCanonicalResellerMapRepo = new UserCanonicalResellerMapRepo(db);
const userRoleRepo = new UserRoleRepo(db);
const relationshipRepo = new RelationshipRepo(db);
const termsAndConditionsMapRepo = new TermsAndConditionsMapRepo(db);
const merchantRepo = new MerchantRepo(db);
const paymentsConfigurationRepo = new PaymentsConfigurationRepo(db);
const merchantProductRequiredRepo = new MerchantProductRequiredRepo(db);
const merchantBusinessDescriptionRepo = new MerchantBusinessDescriptionRepo(db);
export class CanonicalReseller {
    async getUser(email) {
        const user = await userRepo.findOne({
            where: {
                email: email
            }
        });
        return user;
    }

    async createNewCanonicalReseller(event, resellerId) {
        const { sequelize } = db;
        let transaction = await sequelize.transaction();
        try {
            const body = JSON.parse(event.body);
            body.email = body.canonicalResellerDetails.primaryContactEmail;
            body.isCanonicalResellerMemberInvite = true;
            event.body = JSON.stringify(body);

            const canonicalResellerDetails = { ...body.canonicalResellerDetails };
            const orderDetails = { ...body.orderDetails };
            const canonicalResellerCharges = { ...body.canonicalResellerCharges };
            const reseller = await resellerRepo.findOne({
                where: {
                    id: resellerId
                }
            });

            const resellerBrandingObj = {
                resellerLogo: reseller.logo,
                resellerContactUsPage: reseller.contactUsPageURL,
                portalURL: reseller.portalURL,
                resellerName: reseller.name,
                email: reseller.suportEmail,
                termAndCondPageUrl: reseller.termAndCondPageUrl,
                supportTelNo: reseller.supportTelNo,
                supportEmail: reseller.suportEmail,
                brandingURL: reseller.brandingURL,
                senderEmail: reseller.senderEmail,
                website: reseller.website,
                address: reseller.address
            };

            //user creation
            const tempPassword = await createUserWithTemporaryPassword(
                event,
                db,
                connectDB,
                true,
                resellerBrandingObj.portalURL
            );

            const user = await userRepo.findOne({
                where: {
                    email: body.canonicalResellerDetails.primaryContactEmail
                }
            });

            const addressDto = {
                city: canonicalResellerDetails.city,
                country: canonicalResellerDetails.country,
                postCode: canonicalResellerDetails.postCode,
                addressLine1: canonicalResellerDetails.addressLine1,
                addressLine2: canonicalResellerDetails.addressLine2
            };

            const canonicalResellerAddressId = (await addressRepo.save(addressDto, transaction)).id;

            const canonicalResellerDetailsDto = {
                resellerId: resellerId,
                primaryContactName: canonicalResellerDetails.primaryContactName,
                primaryContactEmail: canonicalResellerDetails.primaryContactEmail,
                telNumber: canonicalResellerDetails.telNumber,
                companyName: canonicalResellerDetails.companyName,
                companyNumber: canonicalResellerDetails.companyNumber,
                companyType: canonicalResellerDetails.companyType,
                companyAddressId: canonicalResellerAddressId,
                orderNumber: orderDetails.orderNumber,
                orderDate: orderDetails.orderDate,
                commencementDate: orderDetails.commencementDate,
                initialTerm: orderDetails.initialTerm,
                serviceCharge: canonicalResellerCharges.serviceCharge,
                fixedCharge: canonicalResellerCharges.fixedCharge,
                merchantSetupCharge: canonicalResellerCharges.merchantSetupCharge,
                ratePerTransaction: canonicalResellerCharges.ratePerTransaction,
                status: CanonicalResellerStatus.ACTIVE,
                supportNumber: canonicalResellerDetails.supportNumber,
                supportEmail: canonicalResellerDetails.supportEmail
                    ? canonicalResellerDetails.supportEmail
                    : canonicalResellerDetails.primaryContactEmail,
                logoUrl: canonicalResellerDetails.logoUrl,
                cssUrl: canonicalResellerDetails.cssUrl,
                tradingName: canonicalResellerDetails.tradingName,
                websiteUrl: canonicalResellerDetails.websiteUrl
            };
            const canonicalResellerId = (await canonicalResellerRepo.save(canonicalResellerDetailsDto, transaction)).id;

            await createUserCanonicalResellerRelationship(user.id, resellerId, canonicalResellerId, transaction);

            const userRole = await userRoleRepo.findOne({
                where: {
                    name: 'Owner'
                }
            });
            await createUserRelationship(user.id, null, userRole.id, transaction, resellerId);

            let portalLink = process.env.WEB_CLIENT_URL;
            if (process.env.CUSTOM_DOMAINS) {
                for (let domain of process.env.CUSTOM_DOMAINS.split(',')) {
                    if (domain.includes(reseller.portalURL)) {
                        portalLink = domain;
                        break;
                    }
                }
            }

            let locationStartPath = process.env.CUSTOM_DOMAINS
                ? portalLink
                : `${portalLink}/${encodeURIComponent(reseller.portalURL)}`;

            const changePasswordLink = `${locationStartPath}/signup?email=${encodeURIComponent(
                canonicalResellerDetails.primaryContactEmail
            )}&phone=${encodeURIComponent(canonicalResellerDetails.telNumber)}&oldPassword=${encodeURIComponent(
                tempPassword
            )}`;

            const emailText = canonicalResellerAccountSignupEmail(
                resellerBrandingObj,
                canonicalResellerDetails.primaryContactName,
                canonicalResellerDetails.primaryContactEmail,
                changePasswordLink
            );

            const subject = `Welcome to ${resellerBrandingObj.resellerName}`;

            await sendEmail({
                email: canonicalResellerDetails.primaryContactEmail,
                subject: subject,
                message: emailText,
                resellerBrandingObj
            });

            await transaction.commit();
            return canonicalResellerId;
        } catch (err) {
            if (transaction) {
                await transaction.rollback();
            }

            throw err;
        }
    }

    async getCanonicalResellersByUserId(userId) {
        let userCanonicalResellerMaps = await userCanonicalResellerMapRepo.findAll({ where: { userId } });
        let canonicalResellerIds = _.map(userCanonicalResellerMaps, 'canonicalResellerId');

        const relationShip = await relationshipRepo.findOne({ where: { userId: userId, merchantId: null } });
        const userRole = await userRoleRepo.findOne({
            where: {
                id: relationShip.roleId
            }
        });

        let canonicalResellers = [];
        if (!_.isEmpty(canonicalResellerIds)) {
            canonicalResellers = await canonicalResellerRepo.findAll({
                where: { id: { [Op.in]: canonicalResellerIds } }
            });
        }

        const canonicalResellerData = {
            canonicalResellers: canonicalResellers,
            userRole: userRole.name
        };

        return canonicalResellerData;
    }

    async getAllTermsAndConditions(canonicalResellers) {
        try {
            const termsAndConditions = await termsAndConditionsMapRepo.findAll({
                where: {
                    canonicalResellerId: {
                        [Op.in]: canonicalResellers.map((canonicalReseller) => canonicalReseller.id)
                    }
                },
                include: [
                    {
                        model: db.TermsAndConditions,
                        required: false
                    }
                ]
            });

            const canonicalResellerTAndCMap = {};
            for (let i = 0; i < termsAndConditions.length; i++) {
                let termsAndConditionSigningStatus = {
                    signingStatus: termsAndConditions[i].status,
                    signedOn: termsAndConditions[i].activatedAt,
                    tcId: termsAndConditions[i].tcId
                };
                if (canonicalResellerTAndCMap[termsAndConditions[i].canonicalResellerId]) {
                    let existingTAndC = {
                        ...canonicalResellerTAndCMap[termsAndConditions[i].canonicalResellerId]
                    };
                    let existingSigningInfo = { ...existingTAndC.signingInfo };
                    let existingTermsAncConditionDocument = [...existingTAndC.termsAncConditionDocument];
                    const countObject = {
                        noOfNotSignedTermsAndConditions:
                            termsAndConditions[i].status === 'pending'
                                ? existingSigningInfo.noOfNotSignedTermsAndConditions + 1
                                : existingSigningInfo.noOfNotSignedTermsAndConditions,
                        noOfSignedTermsAndConditions:
                            termsAndConditions[i].status === 'active'
                                ? existingSigningInfo.noOfSignedTermsAndConditions + 1
                                : existingSigningInfo.noOfSignedTermsAndConditions,
                        signedTermsAndConditionsDate: termsAndConditions[i].activatedAt
                    };

                    const canonicalResellerTermsAndCondition = {
                        ...JSON.parse(JSON.stringify(termsAndConditions[i].TermsAndCondition))
                    };
                    termsAndConditionSigningStatus = {
                        ...termsAndConditionSigningStatus,
                        link: canonicalResellerTermsAndCondition.link
                    };
                    existingTermsAncConditionDocument.push(termsAndConditionSigningStatus);

                    const tAndCInfo = {
                        signingInfo: countObject,
                        termsAncConditionDocument: existingTermsAncConditionDocument
                    };

                    canonicalResellerTAndCMap[termsAndConditions[i].canonicalResellerId] = tAndCInfo;
                } else {
                    const countObject = {
                        noOfNotSignedTermsAndConditions: termsAndConditions[i].status === 'pending' ? 1 : 0,
                        noOfSignedTermsAndConditions: termsAndConditions[i].status === 'active' ? 1 : 0,
                        signedTermsAndConditionsDate: termsAndConditions[i].activatedAt
                    };

                    const canonicalResellerTermsAndCondition = {
                        ...JSON.parse(JSON.stringify(termsAndConditions[i].TermsAndCondition))
                    };
                    termsAndConditionSigningStatus = {
                        ...termsAndConditionSigningStatus,
                        link: canonicalResellerTermsAndCondition.link
                    };

                    const tAndCArray = [];
                    tAndCArray.push(termsAndConditionSigningStatus);
                    const tAndCInfo = {
                        signingInfo: countObject,
                        termsAncConditionDocument: tAndCArray
                    };

                    canonicalResellerTAndCMap[termsAndConditions[i].canonicalResellerId] = tAndCInfo;
                }
            }

            return canonicalResellerTAndCMap;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getAllCanonicalResellers(resellerId, searchValue, offset, limit) {
        try {
            let searchQuery = { resellerId: { [Op.eq]: resellerId } };

            searchValue = '%' + searchValue + '%';

            searchQuery = {
                ...searchQuery,
                [Op.or]: [{ id: { [Op.like]: searchValue } }, { companyName: { [Op.like]: searchValue } }]
            };

            const canonicalResellers = await canonicalResellerRepo.findAll({
                where: searchQuery,
                raw: true,
                offset: offset ? offset : null,
                limit: limit ? limit : null,
                order: [['created_at', 'DESC']]
            });

            const dtoCanonicalResellers = canonicalResellers.map((canonicalReseller) => ({
                id: canonicalReseller.id,
                name: canonicalReseller.companyName,
                status: canonicalReseller.status,
                createdDate: canonicalReseller.created_at
            }));

            const countRelationships = await canonicalResellerRepo.count({
                where: searchQuery,
                distinct: 'id'
            });

            return {
                canonicalResellers: dtoCanonicalResellers,
                count: countRelationships
            };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getCanonicalResellerData(canonicalResellerId) {
        try {
            const canonicalReseller = await canonicalResellerRepo.findOne({
                where: { id: canonicalResellerId }
            });

            const canonicalResellerAddressId = canonicalReseller.companyAddressId;
            const canonicalResellerAddress = await addressRepo.findOne({
                where: { id: canonicalResellerAddressId }
            });

            const canonicalResellerDto = {
                resellerId: canonicalReseller.resellerId,
                primaryContactName: canonicalReseller.primaryContactName,
                primaryContactEmail: canonicalReseller.primaryContactEmail,
                telNumber: canonicalReseller.telNumber,
                companyName: canonicalReseller.companyName,
                websiteUrl: canonicalReseller.websiteUrl,
                city: canonicalResellerAddress.city,
                country: canonicalResellerAddress.country,
                postCode: canonicalResellerAddress.postCode,
                addressLine1: canonicalResellerAddress.addressLine1,
                addressLine2: canonicalResellerAddress.addressLine2
            };

            return { canonicalResellerDto: canonicalResellerDto };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async updateCanonicalResellerData(canonicalResellerId, canonicalResellerDetails) {
        const { sequelize } = db;
        let transaction = await sequelize.transaction();

        try {
            const canonicalReseller = await canonicalResellerRepo.findOne({
                where: { id: canonicalResellerId }
            });
            const canonicalResellerAddressId = canonicalReseller.companyAddressId;

            const needAddressUpdate =
                canonicalResellerDetails.addressLine1 ||
                canonicalResellerDetails.addressLine2 ||
                canonicalResellerDetails.city ||
                canonicalResellerDetails.country ||
                canonicalResellerDetails.postCode;

            if (needAddressUpdate) {
                const addressDto = {
                    city: canonicalResellerDetails.city,
                    country: canonicalResellerDetails.country,
                    postCode: canonicalResellerDetails.postCode,
                    addressLine1: canonicalResellerDetails.addressLine1,
                    addressLine2: canonicalResellerDetails.addressLine2
                };

                await addressRepo.update(canonicalResellerAddressId, addressDto, transaction);
            }

            const needCanonicalResellerUpdate =
                canonicalResellerDetails.telNumber ||
                canonicalResellerDetails.websiteUrl ||
                canonicalResellerDetails.companyName;

            if (needCanonicalResellerUpdate) {
                const canonicalResellerDto = {
                    telNumber: canonicalResellerDetails.telNumber,
                    websiteUrl: canonicalResellerDetails.websiteUrl,
                    companyName: canonicalResellerDetails.companyName
                };

                await canonicalResellerRepo.update(canonicalReseller.id, canonicalResellerDto, transaction);
            }

            await transaction.commit();
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            console.log(error);
            throw error;
        }
    }
    async getAquirerDetails(canonicalResellerId, merchantId) {
        try {
            const resellerMerchantsData = await merchantRepo.findOne({
                where: {
                    canonicalResellerId: canonicalResellerId,
                    id: merchantId
                },
                attributes: ['id', 'canonicalResellerId']
            });
            if (!resellerMerchantsData) {
                return;
            }
            const paymentsConfiguration = await paymentsConfigurationRepo.findAll({
                where: {
                    merchantId: merchantId
                },
                attributes: ['mid', 'acquirerBank', 'merchantId']
            });

            const mccCode = await merchantBusinessDescriptionRepo.findOne({
                where: {
                    merchantId: merchantId
                },
                include: {
                    model: db.BusinessDescription,
                    attributes: ['name']
                }
            });

            let tcIds = await termsAndConditionsMapRepo.findAll({
                where: {
                    merchantId: merchantId,
                    status: ['pending', 'active']
                },
                attributes: ['tcId', 'merchantId'],
                include: [
                    {
                        model: db.TermsAndConditions,
                        required: false,
                        where: {
                            creator: 'acquirer'
                        },
                        attributes: ['link', 'acquirerId'],
                        include: {
                            model: db.Acquirers,
                            attributes: ['name']
                        }
                    }
                ]
            });
            let acquirerData = [];
            if (tcIds.length !== 0) {
                let parsedData = JSON.parse(JSON.stringify(tcIds));
                parsedData.forEach((item) => {
                    const tcData = {
                        link: item.TermsAndCondition.link,
                        acquirerId: item.TermsAndCondition.acquirerId,
                        acquirerMid: paymentsConfiguration.filter(
                            (config) => config.acquirerBank === item.TermsAndCondition.Acquirer.name
                        )[0].mid,
                        acquirerName: item.TermsAndCondition.Acquirer.name
                    };
                    acquirerData.push(tcData);
                });
            }
            const midTypesResponse = await merchantProductRequiredRepo.findOne({
                where: {
                    merchantId: merchantId
                },
                attributes: ['merchantId', 'productRequiredId'],
                include: [
                    {
                        model: db.ProductRequired,
                        attributes: ['name']
                    }
                ]
            });

            let acquirerDetails = {
                mccCode: mccCode.BusinessDescription.name,
                midTypesResponse: midTypesResponse.ProductRequired.name,
                acquirerData: acquirerData
            };

            return acquirerDetails;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

async function createUserCanonicalResellerRelationship(userId, resellerId, canonicalResellerId, transaction) {
    const userCanonicalResellerMapDto = {
        userId: userId,
        resellerId: resellerId,
        canonicalResellerId: canonicalResellerId
    };

    await userCanonicalResellerMapRepo.save(userCanonicalResellerMapDto, transaction);
}

async function createUserRelationship(userId, merchantId, roleId, transaction, resellerId) {
    const relationshipDto = {
        userId: userId,
        clientId: null,
        merchantId: merchantId,
        roleId: roleId,
        resellerId: resellerId
    };

    await relationshipRepo.save(relationshipDto, transaction);
}
