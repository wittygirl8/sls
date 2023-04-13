require('dotenv').config();

const { response, middy, userAccessValidatorMiddleware } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');
const { GeneralOTPService } = require('../../business-logic/generalOTP.service');
const generalOTPService = new GeneralOTPService();

export const verifyOTP = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;
        const body = JSON.parse(event.body);
        const phoneNumber = await generalOTPService.getPhoneNumber(event);
        if (!phoneNumber) {
            return response({ data: 'Mobile number does not exist' }, 404);
        }
        const otpResponse = await generalOTPService.verifyOtp(merchantId, { ...body, phoneNumber });
        const { isMatch, isExpired } = otpResponse;
        if (isMatch) {
            return response({ data: 'Otp Verified' }, 200);
        } else if (isExpired) {
            return response({ data: 'Code has expired! Please enter a valid code.' }, 400);
        } else {
            return response({ data: 'Incorrect code entered! Please try again.' }, 400);
        }
    } catch (error) {
        return response({ data: 'Something went wrong! Please try again' }, 400);
    }
}).use(userAccessValidatorMiddleware());
