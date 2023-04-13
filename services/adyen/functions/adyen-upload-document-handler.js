'use strict';
const { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');

const { AdyenService } = require('../business-logic/adyen.service');
const adyenService = new AdyenService();

export const adyenUploadDocumentHandler = async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;
        const documentId = event.pathParameters.documentId;
        const data = JSON.parse(event.body);

        const adyenResponse = await adyenService.updateAdyenDocument(merchantId, documentId, data);

        if (adyenResponse?.message) {
            return response(adyenResponse.message, adyenResponse.status);
        }

        return response(adyenResponse);
    } catch (error) {
        console.error('error in update document on adyen', error);
        return response(error, 500);
    }
};
