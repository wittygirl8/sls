const { IS_OFFLINE } = process.env;

const { response, middy, userAccessValidatorMiddleware } = IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
const { InvoiceService } = require('./../business-logic/Invoice.service');

const invoiceService = new InvoiceService();

export const sendPaymentInvoice = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;
        const body = JSON.parse(event.body);
        await invoiceService.sendPaymentInvoiceByEmailOrPhone(event, merchantId, body);
        return response({ message: 'Invoice has been sent successfully.', success: true }, 200);
    } catch (e) {
        return response({ message: 'Something went wrong! Try again', success: false, error: e }, 400);
    }
}).use(userAccessValidatorMiddleware());
