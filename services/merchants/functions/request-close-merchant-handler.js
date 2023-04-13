require('dotenv').config();

var { response, getUserId, middy, userAccessValidatorMiddleware } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { MerchantService } = require('../business-logic/merchant.service');
var { EmailNotifyCloseAccountRequestService } = require('../business-logic/email-notify-close-account-request.service');

const merchantService = new MerchantService();
const emailNotifyCloseAccountRequestService = new EmailNotifyCloseAccountRequestService();

export const requestCloseMerchant = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;
        const userId = await getUserId(event);
        const body = JSON.parse(event.body);

        await emailNotifyCloseAccountRequestService.send(merchantId, body.resellerId, userId);

        await merchantService.requestClose(merchantId);

        return response({});
    } catch (err) {
        console.log(err);
        return response({}, 500);
    }
}).use(userAccessValidatorMiddleware());
