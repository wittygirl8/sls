import { CognitoCustomMessagesService } from '../business-logic/cognito-custom-messages.service';
const cognitoCustomMessagesService = new CognitoCustomMessagesService();

export const customizeMessage = async (event) => {
    try {
        const userAttributes = event.request.userAttributes;
        const codeParameter = event.request.codeParameter;
        const clientMetadata = event.request.clientMetadata;
        const firstTimePasswordReset = userAttributes['cognito:user_status'] === 'RESET_REQUIRED';

        if (event.triggerSource === 'CustomMessage_ForgotPassword') {
            const response = await cognitoCustomMessagesService.sendForgotPasswordEmail(
                userAttributes,
                codeParameter,
                clientMetadata.portalURL,
                firstTimePasswordReset
            );
            if (firstTimePasswordReset) {
                event.response.smsMessage = 'Your Datman confirmation code is ' + codeParameter;
            }

            event.response.emailSubject = response.emailSubject;
            event.response.emailMessage = response.emailTemplate;
        }
        return event;
    } catch (err) {
        console.error(err);
        throw err;
    }
};
