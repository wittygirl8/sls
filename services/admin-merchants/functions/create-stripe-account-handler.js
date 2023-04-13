'use strict';
const {
    response,
    middy,
    models,
    userTypesValidatorMiddleware,
    countryISOCodeFromName,
    getUserId,
    auditLogsPublisher
} = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

var { MerchantRepo } = require('../../../libs/repo/merchant.repo');
var { OwnersDetailsRepo } = require('../../../libs/repo/ownerdetails.repo');
const merchantRepo = new MerchantRepo(db);
const ownerDetailsRepo = new OwnersDetailsRepo(db);

var { StripeService } = require('../business-logic/stripe.service');
const stripeService = new StripeService();

const { UserType } = models;

export const createStripeAccount = middy(async (event) => {
    try {
        const merchantId = event.pathParameters?.id;
        const userId = await getUserId(event);
        const merchant = await merchantRepo.findOne({
            where: {
                id: merchantId
            }
        });

        if (!merchant) {
            return response({}, 404);
        }
        const ownersDetails = await ownerDetailsRepo.findOne({
            where: {
                id: merchant.primaryOwnerId
            }
        });

        if (!merchant.legalName && (!ownersDetails || !ownersDetails.email)) {
            return response({ missing: ['legal name', 'owner email'] }, 400);
        } else if (!ownersDetails || !ownersDetails.email) {
            return response({ missing: ['owner email'] }, 400);
        } else if (!merchant.legalName) {
            return response({ missing: ['legal name'] }, 400);
        }

        const stripeAccountId = await stripeService.createStripeAccount(
            ownersDetails ? ownersDetails.email : '',
            merchant.legalName,
            countryISOCodeFromName[merchant.country]
        );

        if (stripeAccountId) {
            const updatedMerchant = await merchantRepo.update(merchant.id, {
                stripeId: stripeAccountId ? stripeAccountId : null,
                stripeIdUpdated: 1,
                stripeAccountType: 'DATMAN',
                autoWithdraw: '0'
            });

            const updatedMerchantDto = {
                beforeUpdate: merchant,
                afterUpdate: updatedMerchant,
                tableName: 'merchants'
            };
            const auditLogData = [updatedMerchantDto];

            const auditLogDto = {
                data: {
                    auditLogData,
                    userId: userId,
                    merchantId: merchantId,
                    lambadaName: 'createStripeAccount',
                    identity: event.requestContext.identity
                },
                queueUrl: process.env.AUDIT_LOGS_QUEUE_URL
            };
            await auditLogsPublisher(auditLogDto);
            return response({ stripeId: stripeAccountId }, 200);
        } else {
            return response({}, 500);
        }
    } catch (error) {
        console.error(error);
        return response({}, 500);
    }
}).use(userTypesValidatorMiddleware([UserType.ADMIN]));
