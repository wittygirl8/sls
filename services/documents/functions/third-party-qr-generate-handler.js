var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
var { ThirdPartyQrService } = require('../business-logic/third_party_qr.service');

const thirdPartyQrService = new ThirdPartyQrService();

export const thirdPartyQrCodeGenerate = async (event) => {
    try {
        const result = await thirdPartyQrService.generateQrCodeForThirdParty(event);
        if (result) {
            return response(result, 200);
        } else {
            return response({ errorMessage: 'Entity not found' }, 404);
        }
    } catch (err) {
        console.error(err);
        return response('An error occurred, please contact support or try again', 500);
    }
};
