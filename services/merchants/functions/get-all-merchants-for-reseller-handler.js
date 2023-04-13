var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
var { MerchantService } = require('../business-logic/merchant.service');

const merchantService = new MerchantService();

export const getAllMerchantsForReseller = async (event) => {
    try {
        const resellerId = event.pathParameters.resellerId;
        const body = JSON.parse(event.body);

        const merchantsDto = await merchantService.getAllMerchantsForReseller(resellerId, body);

        const count = await merchantService.countAllMerchantsForReseller(resellerId, body);

        return response({ merchants: merchantsDto, count: count });
    } catch (err) {
        console.error(err);
        return response({}, 500);
    }
};
