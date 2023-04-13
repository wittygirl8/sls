var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
var { MerchantService } = require('../business-logic/merchant.service');

const merchantService = new MerchantService();

export const updateMerchantInfo = async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;
        const body = JSON.parse(event.body);
        const newMerchantInfo = await merchantService.updateMerchantInfo(merchantId, body.name, body.country);
        return response({ name: newMerchantInfo.name, country: newMerchantInfo.country });
    } catch (err) {
        console.log(err);
        return response({}, 500);
    }
};
