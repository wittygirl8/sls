import { AuthCognitoService } from '../business-logic/auth-cognito.service';
const authCognitoService = new AuthCognitoService();
const { signUpValidation } = require('../helper/signup-validation');

export const preAuthEvent = async (event) => {
    try {
        const userAttributes = event.request.userAttributes;
        console.log('userAttributes', userAttributes);
        const request_third_party_data = userAttributes['custom:request3PartyData'];
        const request_signature = userAttributes['custom:requestSignature'];
        const resellerPortalUrl = userAttributes['custom:resellerUrl'];
        const invitedUser = userAttributes['custom:invited'];
        const email = userAttributes.email;
        if (!invitedUser) {
            await signUpValidation(request_third_party_data, request_signature, email);
        }

        const userName = event.userName;
        const phoneNumber = userAttributes.phone_number;
        const triggerSource = event.triggerSource;

        if (!invitedUser) {
            const source = 'Cognito';
            if (triggerSource !== 'PreSignUp_ExternalProvider') {
                await authCognitoService.connectSocialAccountWithMyPayUser(userName, userAttributes, source);
                await authCognitoService.sendEmailConfirmationMessage(email, resellerPortalUrl);
            }

            event.response.autoVerifyEmail = false;
            event.response.autoVerifyPhone = phoneNumber ? true : false;
            event.response.autoConfirmUser = true;
        }

        return event;
    } catch (err) {
        console.error(err);
        throw err;
    }
};
