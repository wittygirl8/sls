'use strict';
var { response, middy, models, userTypesValidatorMiddleware } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
const { AdyenService } = require('../business-logic/adyen.service');
const adyenService = new AdyenService();
const { UserType } = models;

export const getAdyenAccountsHandler = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;
        const result = await adyenService.getAllAdyenAccounts(merchantId);
        return response(result);
    } catch (err) {
        console.error(err);
        return response({}, 500);
    }
}).use(userTypesValidatorMiddleware([UserType.ADMIN]));
