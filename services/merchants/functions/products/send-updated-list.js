var { response } = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');
var { EmailNotifyUpdatedProducts } = require('../../business-logic/email-notify-updated-products.service');

const emailNotifyUpdatedProducts = new EmailNotifyUpdatedProducts();
export const sendUpdatedList = async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;
        const body = JSON.parse(event.body);
        const updatedProducts = await emailNotifyUpdatedProducts.send(merchantId, body.updatedProduct, body.resellerId);

        return response(updatedProducts);
    } catch (error) {
        console.error(error);
        return response({}, 500);
    }
};
