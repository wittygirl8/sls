var { response, userAccessValidatorMiddleware, middy } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { BusinessDetailsService } = require('../../business-logic/business-details.service');

export const getMerchantBusinessTypeAndBankStatus = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.id;
        const merchantBusinessType = await new BusinessDetailsService().getMerchantBusinessTypeAndBankStatus(
            merchantId
        );
        return response(merchantBusinessType);
    } catch (error) {
        console.error(error);
        return response({}, 500);
    }
}).use(userAccessValidatorMiddleware('id'));
