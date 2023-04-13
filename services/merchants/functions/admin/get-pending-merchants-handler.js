require('dotenv').config();

var { response, middy, userTypesValidatorMiddleware, models } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { MerchantService } = require('../../business-logic/merchant.service');
const { UserType } = models;
const merchantService = new MerchantService();

export const getPendingMerchantsForAdmin = middy(async (event) => {
    try {
        const resellerId = event.pathParameters.resellerId;
        const body = JSON.parse(event.body);
        const { searchValue, offset, limit, statusFilter, dateRange } = body;

        const responsePendingMerchants = await merchantService.getAndCountAdminPendingMerchants(
            resellerId,
            searchValue,
            offset,
            limit,
            statusFilter,
            dateRange
        );

        return response({
            pendingMerchants: responsePendingMerchants.merchants,
            count: responsePendingMerchants.count
        });
    } catch (err) {
        console.error(err);
        return response({}, 500);
    }
}).use(userTypesValidatorMiddleware([UserType.ADMIN]));
