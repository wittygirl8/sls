var { response, middy, models, userTypesValidatorMiddleware, auditLogsPublisher, getUserId } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');

var { StripeService } = require('../business-logic/stripe.service');
const stripeService = new StripeService();

var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

var { MerchantRepo } = require('../../../libs/repo/merchant.repo');
const merchantRepo = new MerchantRepo(db);
const { UserType } = models;

export const updateStripeAccount = middy(async (event) => {
    try {
        const body = JSON.parse(event.body);
        const updatedStripeId = body.updatedStripeId;
        const merchantId = event.pathParameters.merchantId;
        const userId = await getUserId(event);
        const merchant = await merchantRepo.findOne({
            where: {
                id: merchantId
            }
        });

        if (!merchant) {
            return response({}, 404);
        }

        let stripeAccountDto;
        if (updatedStripeId !== 'RESET') {
            stripeAccountDto = await stripeService.getStripeAccount(updatedStripeId);
        }

        if (stripeAccountDto && stripeAccountDto.errorMessage) {
            return response(stripeAccountDto.errorMessage, 404);
        } else {
            const updatedMerchant = await merchantRepo.update(merchant.id, {
                stripeId: updatedStripeId,
                stripeIdUpdated: 1,
                stripeAccountType: updatedStripeId === 'RESET' ? updatedStripeId : stripeAccountDto.stripeAccountType
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
                    lambadaName: 'updateStripeAccount',
                    identity: event.requestContext.identity
                },
                queueUrl: process.env.AUDIT_LOGS_QUEUE_URL
            };
            await auditLogsPublisher(auditLogDto);
            return response({}, 200);
        }
    } catch (err) {
        console.error(err);
        return response({}, 500);
    }
}).use(userTypesValidatorMiddleware([UserType.ADMIN]));
