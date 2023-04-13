require('dotenv').config();

var { response, middy, userAccessValidatorMiddleware } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { QrGenerateService } = require('../business-logic/qr-generate.service');
const { QRStatus } = require('../utils/qr-status');
const qrGenerateService = new QrGenerateService();

export const closeQrCode = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;
        const id = event.pathParameters.id;
        const reason = event.body;
        const status = QRStatus.CLOSED;
        const qrCode = await qrGenerateService.closeQrCode(merchantId, id, reason, status);
        return response({ result: 'success', qrCode: qrCode });
    } catch (err) {
        console.log(err);
        return response({}, 500);
    }
}).use(userAccessValidatorMiddleware());
