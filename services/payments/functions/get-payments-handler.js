require('dotenv').config();

var { response, middy, userAccessValidatorMiddleware } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
const { PaymentService } = require('../business-logic/payments.service');
const paymentService = new PaymentService();

export const getPayments = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;
        const body = JSON.parse(event.body);
        const paymentResponse = await paymentService.getPayments(event, merchantId, body);
        return paymentResponse;
    } catch (err) {
        console.log(err);
        return response({}, 500);
    }
}).use(userAccessValidatorMiddleware());
