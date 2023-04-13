import { MerchantService } from '../../business-logic/merchant.service';
import { EmailNotifyAdminCloseAccountService } from '../../business-logic/email-notify-admin-close-account.service';
import { EmailNotifyUpdateAutoWithdrawalsService } from '../../business-logic/email-notify-update-auto-withdrawal.service';
require('dotenv').config();
import Axios from 'axios';

var { connectDB } = process.env.IS_OFFLINE ? require('../../../../layers/models_lib/src') : require('models');
var { response, MerchantStatus, getUserId, middy, userTypesValidatorMiddleware, models } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');

const {
    MerchantRepo,
    PaymentsConfigurationRepo,
    ExternalMerchantIdsRepo,
    ResellerRepo,
    RelationshipRepo,
    OwnersDetailsRepo,
    UserRepo,
    BusinessBankDetailsRepo
} = require('../../../../libs/repo');

const { MerchantCountries } = require('../../helpers/MerchantCountries');
var { sendEmail, rejectionEmailTemplate, auditLogsPublisher } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');

const { foodHubWebHook } = require('../../helpers/foodHubWebHookUrl');

const { UserType } = models;
const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);
const { Op } = db.Sequelize;
const merchantRepo = new MerchantRepo(db);
const externalMerchantIdsRepo = new ExternalMerchantIdsRepo(db);
const merchantService = new MerchantService();
const emailNotifyAdminCloseAccountService = new EmailNotifyAdminCloseAccountService();
const emailNotifyUpdateAutoWithdrawalsService = new EmailNotifyUpdateAutoWithdrawalsService();
const resellerRepo = new ResellerRepo(db);
const relationshipRepo = new RelationshipRepo(db);
const userRepo = new UserRepo(db);
const paymentsConfigurationRepo = new PaymentsConfigurationRepo(db);
const ownersDetailsRepo = new OwnersDetailsRepo(db);
const businessBankDetailsRepo = new BusinessBankDetailsRepo(db);
const { MerchantStatusIdToName } = require('../../helpers/MerchantStatus');
const BANK_TOKENIZATION_API_URL = process.env.BANK_TOKENIZATION_API_URL;
const BANK_TOKENIZATION_API_KEY = process.env.BANK_TOKENIZATION_API_KEY;

export const updateMerchantDataForAdmin = middy(async (event) => {
    let transaction;

    try {
        transaction = await db.sequelize.transaction();
        let auditLogData = [];
        const merchantId = event.pathParameters.merchantId;
        const data = JSON.parse(event.body);
        const resellerId = data.resellerId;
        const userId = await getUserId(event);
        const rejectThroughMerchantVerification = data.rejectThroughMerchantVerification;
        const testMode = data.testMode;
        const threeDSecure = data.threeDSecure;
        const merchant = await merchantRepo.findOne({
            where: {
                id: merchantId
            }
        });

        if (!merchant) {
            return null;
        }

        let throughAccountVerification = false;
        let autoWithdrawalUpdate;
        let autoWithdraw = false;
        let isWatchListClient =
            data.status === MerchantStatus.WATCHLIST || merchant.status === MerchantStatus.WATCHLIST;

        if (merchant.country === MerchantCountries.UNITED_KINGDOM && !merchant.stripeId) {
            autoWithdrawalUpdate = data.autoWithdraw ? true : false;
            autoWithdraw = data.autoWithdraw ? data.autoWithdraw : merchant.autoWithdraw;
        }

        if (
            (data.bankVerify === '1' ||
                data.accountVerify === '1' ||
                data.allowWithdrawals === '1' ||
                data.autoWithdraw === '1' ||
                data.internalTransferStatus === '1') &&
            merchant.status === MerchantStatus.WATCHLIST
        ) {
            return null;
        }

        if (data.status === MerchantStatus.WATCHLIST) {
            data.bankVerify = '0';
            data.accountVerify = '0';
            data.allowWithdrawals = '0';
            data.internalTransferStatus = '0';
            autoWithdraw = '0';
        }

        let internalTransferStatus = data.internalTransferStatus
            ? data.internalTransferStatus
            : merchant.internalTransferStatus;

        if (merchant.country === MerchantCountries.UNITED_KINGDOM) {
            if (
                //when changing status to onboard and is acc verified
                (data.status === MerchantStatus.ACTIVE &&
                    data.status !== merchant.internalTransferStatus &&
                    merchant.isAccountVerified === true) ||
                //or when changing acc to verified and is onboard
                (data.accountVerify === '1' &&
                    merchant.isAccountVerified === false &&
                    merchant.status === MerchantStatus.ACTIVE)
            ) {
                internalTransferStatus = true;
            }
        }

        if (data.status === MerchantStatus.REJECTED && !rejectThroughMerchantVerification) {
            await sendRejectionMail({ merchantId: merchantId, resellerId: resellerId });
        }

        await merchantRepo.update(merchant.id, {
            status: data.status,
            isBankAccountVerified: data.bankVerify,
            isAccountVerified: data.accountVerify,
            allowWithdrawals: data.allowWithdrawals,
            internalTransferStatus: internalTransferStatus,
            autoWithdraw: autoWithdraw,
            isTestMerchant: data.isTestMerchant,
            isReceiptEnabled: data.isReceiptEnabled,
            isInvoiceEnabled: data.isInvoiceEnabled
        });

        if (data.externalMerchant) {
            const externalMerchant = data.externalMerchant;
            var id;
            var isStoreId;
            var externalMerchantId;
            if (externalMerchant.externalMerchantId !== null) {
                id = externalMerchant.externalMerchantId;
                isStoreId = false;
                externalMerchantId = await externalMerchantIdsRepo.findOne({
                    where: {
                        merchantId: merchantId,
                        orderNumber: externalMerchant.index,
                        externalMerchantId: { [Op.not]: null }
                    }
                });
            } else if (externalMerchant.externalMerchantStoreId !== null) {
                id = externalMerchant.externalMerchantStoreId;
                isStoreId = true;
                externalMerchantId = await externalMerchantIdsRepo.findOne({
                    where: {
                        merchantId: merchantId,
                        orderNumber: externalMerchant.index,
                        externalMerchantStoreId: { [Op.not]: null }
                    }
                });
            }

            if (id.toString().length === 0) {
                await externalMerchantIdsRepo.delete(externalMerchantId.id, transaction);
            } else {
                const dto = {
                    merchantId: merchantId,
                    orderNumber: externalMerchant.index,
                    externalMerchantId: isStoreId ? null : id,
                    externalMerchantStoreId: isStoreId ? id : null
                };

                if (externalMerchantId) {
                    await externalMerchantIdsRepo.update(externalMerchantId.id, dto, transaction);
                } else {
                    await externalMerchantIdsRepo.save(dto, transaction);
                }
            }
        }

        let paymentsConfiguration = await paymentsConfigurationRepo.findOne({
            where: { merchantId: merchant.id }
        });
        if (paymentsConfiguration) {
            const updatedPaymentConfig = await paymentsConfigurationRepo.update(paymentsConfiguration.id, {
                testMode: testMode,
                threeDSecure: threeDSecure
            });

            const merchantUpdateDto = {
                beforeUpdate: paymentsConfiguration,
                afterUpdate: updatedPaymentConfig,
                tableName: 'payments_configuration'
            };

            auditLogData.push(merchantUpdateDto);
        }

        const updatedMerchant = await merchantRepo.findOne({
            where: {
                id: merchantId
            }
        });

        //No need to update allowWithdrawals to true as we withdrawal are processed once bank and account are verified
        /* if (
            updatedMerchant.isBankAccountVerified &&
            updatedMerchant.isAccountVerified &&
            !updatedMerchant.allowWithdrawals
        ) {
            await merchantRepo.update(
                updatedMerchant.id,
                {
                    allowWithdrawals: true
                },
                transaction
            );
        } */

        const merchantUpdateDto = {
            beforeUpdate: merchant,
            afterUpdate: updatedMerchant,
            tableName: 'merchants'
        };

        auditLogData.push(merchantUpdateDto);

        const auditLogDto = {
            data: {
                auditLogData,
                userId: userId,
                merchantId: merchantId,
                lambadaName: 'AdminUpdateMerchantData',
                identity: event.requestContext.identity
            },
            queueUrl: process.env.AUDIT_LOGS_QUEUE_URL
        };
        await auditLogsPublisher(auditLogDto);

        const payLoad = JSON.stringify({
            merchant_id: updatedMerchant.id.toString(),
            accountStatus: MerchantStatusIdToName[updatedMerchant.status].toString(),
            payoutStatus:
                updatedMerchant.isAccountVerified && updatedMerchant.isBankAccountVerified ? 'OPEN' : 'BLOCKED',
            provider: 'Datman',
            storeId: updatedMerchant.thirdPartyCustomer?.toString()
        });
        await foodHubWebHook(payLoad);

        if (
            !updatedMerchant.isBankAccountVerified &&
            !updatedMerchant.isAccountVerified &&
            merchant.allowWithdrawals &&
            !+updatedMerchant.allowWithdrawals
        ) {
            await merchantService.sendAccountUnverifiedEmail(updatedMerchant, merchant, resellerId);
        }

        if (
            updatedMerchant.isBankAccountVerified &&
            updatedMerchant.isAccountVerified &&
            updatedMerchant.country === MerchantCountries.AUSTRALIA
        ) {
            await bankTokenization(updatedMerchant);
        }

        await transaction.commit();

        if ((data && data.status) === MerchantStatus.CLOSED) {
            await emailNotifyAdminCloseAccountService.send(merchantId, resellerId, userId);
        }

        if (autoWithdrawalUpdate && !isWatchListClient) {
            await emailNotifyUpdateAutoWithdrawalsService.send(resellerId, merchantId, throughAccountVerification);
        }

        return response({});
    } catch (err) {
        console.error(err);
        await transaction.rollback();
        return response({}, 500);
    }
}).use(userTypesValidatorMiddleware([UserType.ADMIN]));

export const sendRejectionMail = async (params) => {
    const { merchantId, resellerId } = params;
    const reseller = await resellerRepo.findOne({ where: { id: resellerId } });
    const relationship = await relationshipRepo.findOne({ where: { merchantId: merchantId } });
    const user = await userRepo.findByPk(relationship.userId);
    const merchant = await merchantRepo.findOne({ where: { id: merchantId } });

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

    let rejectionMail = rejectionEmailTemplate({ resellerBrandingObj, merchant });
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

    const requestForSupportLink = `${locationStartPath}/request-support-form?merchantId=${encodeURIComponent(
        merchant.id
    )}`;
    rejectionMail = rejectionMail.replace(new RegExp('##request_for_support##', 'g'), requestForSupportLink);
    const subjectLine = resellerBrandingObj.resellerName + ' Merchant Application rejected';

    await sendEmail({
        email: user.email,
        subject: subjectLine,
        message: rejectionMail,
        resellerBrandingObj
    });
};

const bankTokenization = async (merchant) => {
    try {
        const ownersDetails = await ownersDetailsRepo.findOne({
            where: {
                id: merchant.primaryOwnerId
            },
            attributes: ['email']
        });
        const updatedBankDetails = await businessBankDetailsRepo.findOne({
            where: {
                id: merchant.businessBankDetailsId
            }
        });

        var data = JSON.stringify({
            merchantId: merchant.id,
            ownerEmail: ownersDetails.email,
            name: merchant.legalName,
            accountHolderName: updatedBankDetails.accountHolderName,
            bsb: updatedBankDetails.bsb,
            accountNumber: updatedBankDetails.newAccountNumber
        });

        var config = {
            method: 'post',
            url: BANK_TOKENIZATION_API_URL,
            headers: {
                api_key: BANK_TOKENIZATION_API_KEY,
                'Content-Type': 'application/json'
            },
            data: data
        };

        const axios = Axios.create();
        const response = await axios(config);
        console.log('Bank tokenization response: ', response.data);
    } catch (error) {
        console.log('Bank tokenization error: ', error);
    }
};
