'use strict';
const { response, middy, apiTokenAuthorisation } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');

const { BifrostService } = require('../business-logic/bifrost.service');
const bifrostService = new BifrostService();

export const getFirstDataMerchantId = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;
        const merchantData = await bifrostService.getFirstDataMerchantId(merchantId);

        if (!merchantData) {
            return response('First data mid does not exist', 404);
        }
        return response(merchantData);
    } catch (error) {
        console.error('error in get merchants', error);
        return response(error, 500);
    }
}).use(apiTokenAuthorisation());
