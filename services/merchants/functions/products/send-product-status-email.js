var { response } = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');
var { EmailNotifyProductStatus } = require('../../business-logic/email-notify-product-status.service');

const emailNotifyProductStatus = new EmailNotifyProductStatus();
export const sendProductStatus = async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;
        const body = JSON.parse(event.body);
        await emailNotifyProductStatus.sendProduct(
            merchantId,
            body.productId,
            body.resellerId,
            body.status,
            body.reason,
            body.prevStatus
        );
        return response({});
    } catch (error) {
        console.error(error);
        return response({}, 500);
    }
};
