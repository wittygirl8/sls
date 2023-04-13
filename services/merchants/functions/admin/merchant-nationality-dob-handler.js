require('dotenv').config();

var { response, middy, userTypesValidatorMiddleware, models } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { GetMissingData } = require('../../business-logic/missing-merchant-data.service');
const getMissingData = new GetMissingData();
const { UserType } = models;

export const updateMissingData = middy(async (event) => {
    try {
        await getMissingData.updateMissingData(event);
        return response('success', 200);
    } catch (err) {
        console.error(err);
        return response({}, 500);
    }
}).use(userTypesValidatorMiddleware([UserType.ADMIN]));
