import { AuthOtpCognitoService } from '../business-logic/auth-otp-cognito.service';
const authOtpCognitoService = new AuthOtpCognitoService();

const CUSTOM_CHALLENGE = 'CUSTOM_CHALLENGE';
const PASSWORD_VERIFIER = 'PASSWORD_VERIFIER';

export const handler = async (event) => {
    try {
        // If user is not registered
        if (event.request.userNotFound) {
            event.response.issueToken = false;
            event.response.failAuthentication = true;
            throw new Error('User does not exist');
        }

        //SRP FLOW for simple login - ========================================
        if (
            event.request.session.length == 1 &&
            event.request.session[0].challengeName == 'SRP_A' &&
            event.request.session[0].challengeResult == true
        ) {
            event.response.issueTokens = false;
            event.response.failAuthentication = false;
            event.response.challengeName = PASSWORD_VERIFIER;
        } else if (
            event.request.session.length == 2 &&
            event.request.session[1].challengeName == PASSWORD_VERIFIER &&
            event.request.session[1].challengeResult == true
        ) {
            event.response.issueTokens = true;
            event.response.failAuthentication = false;
        }
        //SRP FLOW for simple login end - ========================================

        // wrong OTP even After 3 sessions?
        else if (event.request.session.length >= 3 && event.request.session.slice(-1)[0].challengeResult === false) {
            event.response.issueToken = false;
            event.response.failAuthentication = true;
            throw new Error('Invalid OTP');
        } else if (event.request.session.length > 0 && event.request.session.slice(-1)[0].challengeResult === true) {
            event.response.issueTokens = true;
            event.response.failAuthentication = false;
        } else if (event.request.session.length === 0) {
            // not yet received correct OTP
            await authOtpCognitoService.deleteAllUnused(event.request.userAttributes.email);
            event.response.issueTokens = false;
            event.response.failAuthentication = false;
            event.response.challengeName = CUSTOM_CHALLENGE;
        } else if (
            event.request.session.length >= 1 &&
            event.request.session.slice(-1)[0].challengeName == CUSTOM_CHALLENGE &&
            event.request.session.slice(-1)[0].challengeResult == false
        ) {
            event.response.issueTokens = false;
            event.response.failAuthentication = false;
            event.response.challengeName = CUSTOM_CHALLENGE;
        }

        return event;
    } catch (err) {
        console.error(err);
        throw new Error('Internal error');
    }
};
