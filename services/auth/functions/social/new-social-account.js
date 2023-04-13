const { SocialAuthService } = require('../../business-logic/social-auth.service');
const { response } = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');
let socialAuthService = new SocialAuthService();

export const handler = async (event) => {
    let body;

    if (!event.body) {
        return response({}, 400);
    }
    body = JSON.parse(event.body);

    try {
        await socialAuthService.createUserForSocialFlow(body.providerId, body.userData, body.refreshToken);
        await socialAuthService.sendEmailConfirmationMessage(body.userData.email, body.resellerUrl);

        return response({}, 200);
    } catch (err) {
        console.error(err);
        return response({}, 500);
    }
};
