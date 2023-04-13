'use strict';
const { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');

const { AdyenService } = require('../business-logic/adyen.service');
const adyenService = new AdyenService();

export const adyenUpdateMetadataHandler = async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;
        const resellerId = event.pathParameters.resellerId;
        const data = JSON.parse(event.body);

        const adyenResponse = await adyenService.updateAdyenMetadata(merchantId, resellerId, data);

        return response(adyenResponse);
    } catch (error) {
        console.error('error in update adyen metadata handler', error);
        return response(error, 500);
    }
};
