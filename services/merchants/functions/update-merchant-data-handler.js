var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
var { MerchantService } = require('../business-logic/merchant.service');

const merchantService = new MerchantService();

export const updateMerchantData = async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;
        const body = JSON.parse(event.body);

        await merchantService.updateMerchantData(merchantId, body.accountStatus);
        return response({});
    } catch (err) {
        console.log(err);
        return response({}, 500);
    }
};
