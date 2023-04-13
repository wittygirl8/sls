'use strict';
const { response, middy, models, userTypesValidatorMiddleware } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');

const { AdyenService } = require('../business-logic/adyen.service');
const adyenService = new AdyenService();
const { UserType } = models;

export const getAdyenResponse = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;

        const adyenResponse = await adyenService.getAdyenResponse(merchantId);

        return response(adyenResponse);
    } catch (error) {
        console.error('Adyen response error', error);
        return response(error, 500);
    }
}).use(userTypesValidatorMiddleware([UserType.ADMIN]));
