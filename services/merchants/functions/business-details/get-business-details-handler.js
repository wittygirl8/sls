var { response, middy, userAccessValidatorMiddleware } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { BusinessDetailsService } = require('../../business-logic/business-details.service');

const businessDetailsService = new BusinessDetailsService();
export const getBusinessDetails = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;

        const getResponse = await businessDetailsService.getBusinessDetails(merchantId);
        return response(getResponse);
    } catch (error) {
        console.error(error);
        return response({}, 500);
    }
}).use(userAccessValidatorMiddleware());
