require('dotenv').config();

var { response, middy, userAccessValidatorMiddleware } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { MerchantService } = require('../business-logic/merchant.service');

const merchantService = new MerchantService();

export const getMerchantAcquirer = middy(async (event) => {
    try {
        const data = JSON.parse(event.body);
        const merchant = await merchantService.getMerchantAcquirer(data.merchant_id);

        if (!merchant) {
            return response({}, 404);
        }

        const responseObject = {
            dnaMid: merchant.dnaMid || null
        };

        return response(responseObject);
    } catch (err) {
        console.log(err);
        return response({}, 500);
    }
}).use(userAccessValidatorMiddleware());
