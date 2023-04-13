var { response, middy, userAccessValidatorMiddleware } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { QrGenerateService } = require('../business-logic/qr-generate.service');

const qrGenerateService = new QrGenerateService();

export const qrGenerate = middy(async (event) => {
    try {
        const result = await qrGenerateService.generateQrCode(event);
        if (result) {
            return response(result, 200);
        } else {
            return response({ errorMessage: 'Entity not found' }, 404);
        }
    } catch (err) {
        console.error(err);
        return response({ errorMessage: 'An error occurred, please contact support or try again' }, 500);
    }
}).use(userAccessValidatorMiddleware());
