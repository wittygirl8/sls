require('dotenv').config();

var { response, middy, userTypesValidatorMiddleware, models } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');

const { UserType } = models;
var { DnaOnboardApplicationService } = require('../business-logic/dna-onboard-application.service');
const dnaOnboardApplicationService = new DnaOnboardApplicationService();

export const getMerchantData = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;
        const data = await dnaOnboardApplicationService.getMerchantInfo(merchantId);
        return response(data, 200);
    } catch (err) {
        console.error(err);
        return response({}, 500);
    }
}).use(userTypesValidatorMiddleware([UserType.RESELLER]));
