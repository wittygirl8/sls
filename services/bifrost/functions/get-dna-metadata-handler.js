'use strict';
const { response, middy, apiTokenAuthorisation } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');

const { BifrostService } = require('../business-logic/bifrost.service');
const bifrostService = new BifrostService();

export const getDNAMetadata = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;

        const dnaMetaData = await bifrostService.getDNAMetadata(merchantId);

        if (dnaMetaData && dnaMetaData?.status === 201) {
            return response(dnaMetaData.message, 404);
        }
        return response(dnaMetaData, 200);
    } catch (error) {
        console.error('error in get merchants dna metadata', error);
        return response(error, 500);
    }
}).use(apiTokenAuthorisation());
