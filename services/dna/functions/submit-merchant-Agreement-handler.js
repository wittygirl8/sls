require('dotenv').config();

const { response, userTypesValidatorMiddleware, middy, models } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
const { UserType } = models;
var { DnaVerifyApplicationService } = require('../business-logic/dna-verify-application.service');
const dnaVerifyApplicationService = new DnaVerifyApplicationService();

export const submitMerchantAgreement = middy(async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { merchantId, docUrl, documentId, dnaApplicationId } = body;
        const data = await dnaVerifyApplicationService.submitMsaDoc(merchantId, docUrl, documentId, dnaApplicationId);
        return response(data, 200);
    } catch (err) {
        console.error(err);
        return response({}, 500);
    }
}).use(userTypesValidatorMiddleware([UserType.MERCHANT]));
