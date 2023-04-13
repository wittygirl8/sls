var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
var { RegistrationService } = require('../business-logic/registration.service');

const registrationService = new RegistrationService();

export const canonicalResellerMerchant = async (event) => {
    try {
        const body = JSON.parse(event.body);

        const email = body.externalMerchantEmail;

        if (email) {
            const userExist = await registrationService.getUser(email);

            if (userExist) {
                return response('User already exists with email provided.', 400);
            }
        }

        await registrationService.newCanonicalMerchantRegistrations(event);

        return response({}, 200);
    } catch (err) {
        console.error(err);
        return response('An error occurred, please contact support or try again', 500);
    }
};
