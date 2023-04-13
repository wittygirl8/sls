require('dotenv').config();

var { response, middy, userAccessValidatorMiddleware } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
const { PayoutsService } = require('../business-logic/payouts.service');
const payoutsService = new PayoutsService();

export const getPayouts = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;
        const body = JSON.parse(event.body);

        const payouts = await payoutsService.getPayouts(event, merchantId, body);

        if (!payouts) {
            response('Merchant does not exist!', 400);
        }

        return response({ transaction_data: payouts }, 200);
    } catch (err) {
        console.log(err);
        return response({}, 500);
    }
}).use(userAccessValidatorMiddleware());
