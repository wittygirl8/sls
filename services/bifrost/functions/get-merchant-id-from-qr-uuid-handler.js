'use strict';
const { response, middy, apiTokenAuthorisation } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');

const { MerchantQrService } = require('../business-logic/merchant-qr.service');
const merchantQrService = new MerchantQrService();

export const getMerchantId = middy(async (event, context, callback) => {
    try {
        context.callbackWaitsForEmptyEventLoop = false;
        if (Object.prototype.hasOwnProperty.call(event, 'keep-warm')) {
            console.log('Call is just to warm the lamda function');
            return callback(null, {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*', // Required for CORS support to work
                    'Access-Control-Allow-Credentials': true // Required for cookies, authorization headers with HTTPS
                },
                body: { message: 'warm is done' }
            });
        }
        let payload = event.queryStringParameters;
        const qr_uuid = payload.uuid;
        const payment_type = payload.payment_type;
        const merchantData = await merchantQrService.getMerchantId(qr_uuid, payment_type);

        if (!merchantData) {
            return response('Merchant does not exist', 404);
        }
        return response(merchantData);
    } catch (error) {
        console.error('error in get merchants', error);
        return response(error, 500);
    }
}).use(apiTokenAuthorisation());
