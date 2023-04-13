var { response, middy, userAccessValidatorMiddleware } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { MerchantQrService } = require('../business-logic/merchant_qr.service');
var { QrGenerateService } = require('../business-logic/qr-generate.service');
const qrGenerateService = new QrGenerateService();

const merchantQrService = new MerchantQrService();

export const getQrCode = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;

        const qrCodeResponse = await merchantQrService.getQrCode(merchantId);

        if (!qrCodeResponse) {
            return response({ message: 'Qr code does not exist for this merchant' }, 200);
        }

        return response(qrCodeResponse, 200);
    } catch (err) {
        console.error(err);
        return response('An error occurred, please contact support or try again', 500);
    }
}).use(userAccessValidatorMiddleware());

export const fetchQrCodes = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;
        const body = JSON.parse(event.body);
        const { searchValue, offset, statusFilter, limit } = body;
        const qrCodeResponse = await qrGenerateService.fetchQrCodes(
            merchantId,
            searchValue,
            offset,
            statusFilter,
            limit
        );

        if (!qrCodeResponse) {
            return response({ message: 'Qr code does not exist for this merchant' }, 200);
        }
        return response({ qrCodeResponse: qrCodeResponse.qrCodes, count: qrCodeResponse.count });
    } catch (err) {
        console.error(err);
        return response('An error occurred, please contact support or try again', 500);
    }
}).use(userAccessValidatorMiddleware());
