require('dotenv').config();

var { response, middy, userTypesValidatorMiddleware, models } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');

const { UserType } = models;
var { DnaOnboardApplicationService } = require('../business-logic/dna-onboard-application.service');
const dnaOnboardApplicationService = new DnaOnboardApplicationService();

export const dnaOnboardingRequest = middy(async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { merchantId, resellerId, merchantLegalName, dnaRequest } = body;
        const data = await dnaOnboardApplicationService.dnaOnboardorCancelRequest(
            merchantId,
            resellerId,
            merchantLegalName,
            dnaRequest
        );
        return response(data, 200);
    } catch (err) {
        console.error(err);
        return response({}, 500);
    }
}).use(userTypesValidatorMiddleware([UserType.RESELLER]));
