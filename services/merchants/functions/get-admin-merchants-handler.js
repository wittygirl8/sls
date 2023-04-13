var { response, middy, userTypesValidatorMiddleware, models } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { MerchantService } = require('../business-logic/merchant.service');
const { UserType } = models;
const merchantService = new MerchantService();

export const getAdminMerchants = middy(async (event) => {
    try {
        const resellerId = event.pathParameters.resellerId;
        const body = JSON.parse(event.body);
        const { searchedString, includeMerchantId } = body;

        const merchantsDto = await merchantService.getAdminMerchants(resellerId, searchedString, includeMerchantId);

        return response({ merchants: merchantsDto, count: merchantsDto.length });
    } catch (err) {
        console.error(err);
        return response({}, 500);
    }
}).use(userTypesValidatorMiddleware([UserType.ADMIN]));
