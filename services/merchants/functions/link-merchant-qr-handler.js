var { response, isUUID, middy, userAccessValidatorMiddleware } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');

var { MultipleQrService } = require('../business-logic/multiple-qr.service');
var { MerchantService } = require('../business-logic/merchant.service');

const multipleQrService = new MultipleQrService();
const merchantService = new MerchantService();

const ONBOARDING_STATUS = 3; //For complete onboarding

export const linkMerchantQr = middy(async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { id: uuid } = body;
        const merchantId = event.pathParameters.merchantId;

        if (!isUUID(uuid)) {
            return response({ message: 'Invalid QR Code!' }, 500);
        }

        const merchantData = await merchantService.getById(merchantId); //Use 20 for testing
        const { status, isBankAccountVerified, isAccountVerified } = merchantData;

        if (!(status == ONBOARDING_STATUS && isBankAccountVerified && isAccountVerified)) {
            return response({ message: 'Merchant account is inactive !' }, 500);
        }

        const checkForQRLink = await multipleQrService.getById(uuid);

        if (!checkForQRLink) {
            return response({ message: 'QR Code not found!' }, 404);
        }

        const { merchantId: dmid } = checkForQRLink;

        if (dmid) {
            return response({ message: 'QR already linked!' }, 500);
        }

        let linkData = {
            uuid,
            merchantId,
            status: 'active'
        };

        const linkQrResponse = await multipleQrService.linkWithMerchant(linkData);

        const { uuid: id, merchantId: mid, baseURL: bURL } = linkQrResponse;

        if (id && mid && bURL) {
            return response({ message: 'QR Code linked successfully.' }, 200);
        } else {
            return response({ message: 'Something went wrong while linking QR Code.' }, 500);
        }
    } catch (err) {
        return response({}, 500);
    }
}).use(userAccessValidatorMiddleware());
