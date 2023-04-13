var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
var { MerchantQrService } = require('../business-logic/merchant_qr.service');

const merchantQrService = new MerchantQrService();

export const qrCodeGenerate = async (event) => {
    try {
        await merchantQrService.generateQrCodeForMerchant(event);

        return response({}, 200);
    } catch (err) {
        console.error(err);
        return response('An error occurred, please contact support or try again', 500);
    }
};
