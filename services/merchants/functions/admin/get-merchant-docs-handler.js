require('dotenv').config();

var { response, middy, userTypesValidatorMiddleware, models } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { GetMissingData } = require('../../business-logic/missing-merchant-data.service');
const getMissingData = new GetMissingData();
const { UserType } = models;

export const getMerchantData = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;
        const data = await getMissingData.getMerchantInfo(merchantId);
        return response(data, 200);
    } catch (err) {
        console.error(err);
        return response({}, 500);
    }
}).use(userTypesValidatorMiddleware([UserType.ADMIN]));
