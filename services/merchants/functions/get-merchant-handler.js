require('dotenv').config();

var { response, middy, userAccessValidatorMiddleware } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { MerchantService } = require('../business-logic/merchant.service');

const merchantService = new MerchantService();

export const getMerchant = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;

        const merchant = await merchantService.getById(merchantId);

        if (!merchant) {
            return response({}, 404);
        }
        return response(merchant);
    } catch (err) {
        console.log(err);
        return response({}, 500);
    }
}).use(userAccessValidatorMiddleware());
