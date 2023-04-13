require('dotenv').config();

const { response, middy, userAccessValidatorMiddleware } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');
const { GeneralOTPService } = require('../../business-logic/generalOTP.service');
const generalOTPService = new GeneralOTPService();

export const resendOTP = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;
        const body = JSON.parse(event.body);
        const phoneNumber = await generalOTPService.getPhoneNumber(event);
        if (!phoneNumber) {
            return response({ data: 'Mobile number does not exist' }, 404);
        }
        const otpResponse = await generalOTPService.resendOtp(merchantId, { ...body, phoneNumber });
        if (otpResponse) {
            return response({ data: 'Otp sent successfully' }, 200);
        } else {
            return response({ data: 'Exceeded maximum limit ! Try after some time' }, 400);
        }
    } catch (error) {
        return response({ data: 'Unable to send OTP' }, 400);
    }
}).use(userAccessValidatorMiddleware());
