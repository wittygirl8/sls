require('dotenv').config();

var { response, middy, userTypesValidatorMiddleware, models } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { GetMissingData } = require('../../business-logic/missing-merchant-data.service');
const getMissingMerchantData = new GetMissingData();
const { UserType } = models;

export const getMissingData = middy(async (event) => {
    try {
        const resellerId = event.pathParameters.resellerId;
        const body = JSON.parse(event.body);
        const { offset, limit, searchValue, isAdyen } = body;
        const missingData = await getMissingMerchantData.getMissingMerchant(
            event,
            resellerId,
            offset,
            searchValue,
            limit,
            isAdyen
        );

        return response(missingData, 200);
    } catch (err) {
        console.error(err);
        return response({}, 500);
    }
}).use(userTypesValidatorMiddleware([UserType.ADMIN]));
