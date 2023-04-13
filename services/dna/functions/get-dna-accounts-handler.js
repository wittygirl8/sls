'use strict';
const { response, userTypesValidatorMiddleware, middy, models } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');

const { DnaOnboardApplicationService } = require('../business-logic/dna-onboard-application.service');
const { UserType } = models;
const dnaOnboardApplicationService = new DnaOnboardApplicationService();
export const getDnaAccountsHandler = middy(async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { merchantId, canonicalResellerId, searchValue, statusFilter, limit, offset } = body;
        const dnaResponse = await dnaOnboardApplicationService.getAllDnaAccounts(
            merchantId,
            canonicalResellerId,
            searchValue,
            statusFilter,
            limit,
            offset
        );
        return response(dnaResponse);
    } catch (error) {
        console.error('error in get dna accounts', error);
        return response(error, 500);
    }
}).use(userTypesValidatorMiddleware([UserType.RESELLER, UserType.ADMIN]));
