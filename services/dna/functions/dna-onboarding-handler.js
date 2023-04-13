'use strict';
const { response, middy, models, userTypesValidatorMiddleware } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');

const { UserType } = models;

const { DnaOnboardApplicationService } = require('../business-logic/dna-onboard-application.service');
const dnaOnboardApplicationService = new DnaOnboardApplicationService();
export const dnaOnboardingHandler = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;

        const dnaResponse = await dnaOnboardApplicationService.dnaOnboarding(merchantId);

        return response(dnaResponse, dnaResponse.status);
    } catch (error) {
        console.error('error in onboarding handler', error);
        return response(error, 500);
    }
}).use(userTypesValidatorMiddleware([UserType.ADMIN]));
