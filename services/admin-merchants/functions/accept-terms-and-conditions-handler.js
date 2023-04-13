var { response, middy, models, userTypesValidatorMiddleware } = process.env.IS_OFFLINE
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

export const acceptTermsAndConditions = middy(async (event) => {
    try {
        const stripeId = event.pathParameters.stripeId;
        const merchantId = event.pathParameters.merchantId;
        const merchant = await merchantRepo.findOne({
            where: {
                id: merchantId
            }
        });

        if (!merchant) {
            return response({}, 404);
        }

        const data = await stripeService.acceptTermsAndConditions(stripeId, merchant);

        let requirement;
        if (data.status === 200) {
            if (data.data.verification && data.data.verification.disabled_reason) {
                requirement = JSON.stringify(data.data.verification, null, 2);
            }
        }

        return response({ requirement: requirement }, 200);
    } catch (err) {
        console.error(err);
        return response('An error occurred, please contact support or try again', 500);
    }
}).use(userTypesValidatorMiddleware([UserType.ADMIN]));
