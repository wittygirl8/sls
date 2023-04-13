'use strict';
const { response, userTypesValidatorMiddleware, middy, models } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
const { UserType } = models;
const { DnaOnboardApplicationService } = require('../business-logic/dna-onboard-application.service');

const dnaOnboardApplicationService = new DnaOnboardApplicationService();
export const getDnaTerminalsHandler = middy(async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { merchantId, searchValue } = body;
        const dnaResponse = await dnaOnboardApplicationService.getDnaTerminals(merchantId, searchValue);
        return response(dnaResponse);
    } catch (error) {
        console.error('error in get dna Terminal', error);
        return response(error, 500);
    }
}).use(userTypesValidatorMiddleware([UserType.RESELLER]));
