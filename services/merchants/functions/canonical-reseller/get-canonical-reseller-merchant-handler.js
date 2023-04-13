require('dotenv').config();

var { response, middy, userTypesValidatorMiddleware, models } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');

var { CanonicalResellerMerchantService } = require('../../business-logic/canonical-reseller-merchant.service');

const canonicalResellerMerchantService = new CanonicalResellerMerchantService();
const { UserType } = models;

export const getCanonicalResellerMerchantData = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;

        const merchant = await canonicalResellerMerchantService.getCanonicalResellerMerchant(merchantId);

        if (!merchant) {
            return response({}, 404);
        }
        return response(merchant, 200);
    } catch (err) {
        console.log(err);
        return response({}, 500);
    }
}).use(userTypesValidatorMiddleware([UserType.RESELLER]));
