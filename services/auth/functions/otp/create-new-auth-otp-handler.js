var { response } = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');

import { AuthOtpService } from '../../business-logic/auth-otp.service';
const authOtpService = new AuthOtpService();

const { OTPMethod } = require('../../helpers/OTPMethod');

export const handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const viaPhone = body.viaPhone;
        const parameter = body.parameter;

        const user = await authOtpService.checkExistUser(parameter, viaPhone);
        if (!user) {
            return response('Not found', 404);
        }

        const count = await authOtpService.otpCheck(parameter, viaPhone);

        if (count >= 3) {
            return response('Not found', 404);
        }

        const authOtpDto = {
            email: user.email,
            phone: user.phoneNumber,
            method: viaPhone ? OTPMethod.PHONE : OTPMethod.EMAIL
        };

        await authOtpService.save(authOtpDto);

        return response({ email: user.email }, 200);
    } catch (err) {
        console.error(err);
        return response('Internal exception', 500);
    }
};
