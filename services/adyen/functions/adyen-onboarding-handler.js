'use strict';
const { response, middy, userAccessValidatorMiddleware } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');

const { AdyenService } = require('../business-logic/adyen.service');
const adyenService = new AdyenService();
export const adyenOnboardingHandler = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;
        const resellerId = event.pathParameters.resellerId;
        const adyenLevel = event.pathParameters.adyenLevel;
        const body = JSON.parse(event.body);
        const fhOnboarding = body && body?.fhOnboarding ? body.fhOnboarding : false;

        const adyenResponse = await adyenService.adyenOnboarding(merchantId, resellerId, adyenLevel, fhOnboarding);

        return response(adyenResponse, adyenResponse.status);
    } catch (error) {
        console.error('error in onboarding handler', error);
        return response(error, 500);
    }
}).use(userAccessValidatorMiddleware());
