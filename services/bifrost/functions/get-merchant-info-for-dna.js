'use strict';
const { response, middy, apiTokenAuthorisation } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');

const { BifrostService } = require('../business-logic/bifrost.service');
const bifrostService = new BifrostService();

export const getMerchantDetailsForDNA = middy(async (event) => {
    try {
        const merchantQrId = event.pathParameters.merchantQrId;

        const merchantInfo = await bifrostService.getMerchantInfo(merchantQrId);

        if (merchantInfo && merchantInfo?.status === 201) {
            return response(merchantInfo.message, 404);
        }
        if (!merchantInfo) {
            return response('Merchant does not exist', 404);
        }
        return response(merchantInfo, 200);
    } catch (error) {
        console.error('error in get merchants', error);
        return response(error, 500);
    }
}).use(apiTokenAuthorisation());
