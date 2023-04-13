var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
var { EmailNotifyRequestForSupportService } = require('../business-logic/email-notify-request-for-support.service');

var emailNotifyRequestForSupportService = new EmailNotifyRequestForSupportService();

export const requestForSupport = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const merchantId = body.merchantId;
        const resellerId = body.resellerId;
        await emailNotifyRequestForSupportService.send(body, merchantId, resellerId);

        return response({});
    } catch (error) {
        console.log(error);
        return response('Internal server error', 500);
    }
};
