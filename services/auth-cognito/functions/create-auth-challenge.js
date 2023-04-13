const otpGenerator = require('otp-generator');
const crypto = require('crypto');
const key = 'CKXLt3gUY9uoF5uvErXFJ6YGDQO2srfL';

import { AuthOtpCognitoService } from '../business-logic/auth-otp-cognito.service';
const authOtpCognitoService = new AuthOtpCognitoService();

export const handler = async (event) => {
    try {
        let secretLoginCodeHash;
        if (!event.request.session || !event.request.session.length) {
            // Generate a new secret login code and send it to the user
            secretLoginCodeHash = await createNewOTP(
                event.request.userAttributes.email,
                event.request.userAttributes.given_name,
                event.request.userAttributes['custom:resellerUrl']
            );
        } else {
            // re-use code generated in previous challenge
            const previousChallenge = event.request.session.slice(-1)[0];
            secretLoginCodeHash = previousChallenge.challengeMetadata;
        }

        // Add the secret login code to the private challenge parameters
        // so it can be verified by the "Verify Auth Challenge Response" trigger
        event.response.privateChallengeParameters = { secretLoginCodeHash };

        // Add the secret login code to the session so it is available
        // in a next invocation of the "Create Auth Challenge" trigger
        event.response.challengeMetadata = secretLoginCodeHash;

        return event;
    } catch (err) {
        console.error(err);
        throw new Error('Internal error');
    }
};

const createNewOTP = async (identity, givenName, portalURL) => {
    // Generate a 6 digit numeric OTP
    const otp = otpGenerator.generate(6, { alphabets: false, upperCase: false, specialChars: false });
    const ttl = 5 * 60 * 1000; //5 Minutes in miliseconds
    const expires = Date.now() + ttl; //timestamp to 5 minutes in the future
    const data = `${identity}.${otp}.${expires}`; // phone.otp.expiry_timestamp
    const hash = crypto.createHmac('sha256', key).update(data).digest('hex'); // creating SHA256 hash of the data
    const fullHash = `${hash}.${expires}`; // Hash.expires, format to send to the user

    //Find specific record in OTP table
    const record = await authOtpCognitoService.findLatestNoOtpIssued(identity);
    if (!record) {
        throw new Error('Internal error');
    }

    // email
    if (record.method === 1) {
        //Send email
        await authOtpCognitoService.sendEmailMsg(record.email, givenName, otp, portalURL);
    } else if (record.method === 2) {
        //Send sms
        await authOtpCognitoService.sendSms(record.phone, otp);
    }

    await authOtpCognitoService.updateWithOtp(record.id, { hash, issueTime: Date.now() });

    return fullHash;
};
