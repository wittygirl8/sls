require('dotenv').config();

var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
var { MerchantService } = require('../business-logic/merchant.service');

const merchantService = new MerchantService();

export const getTermsAndConditionsForMerchant = async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;
        const modalTermsAndConditions = event.pathParameters.modalTermsAndConditions;

        const merchantTermsAndConditionDto = await merchantService.getTermsAndConditionsForMerchant(
            merchantId,
            modalTermsAndConditions
        );

        return response(merchantTermsAndConditionDto);
    } catch (err) {
        console.error(err);
        return response({}, 500);
    }
};
