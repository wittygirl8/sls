var { response, middy, userTypesValidatorMiddleware, models } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { CanonicalReseller } = require('../business-logic/canonical-reseller');

const canonicalReseller = new CanonicalReseller();
const { UserType } = models;

export const createCanonicalReseller = middy(async (event) => {
    try {
        const resellerId = event.pathParameters.resellerId;
        const body = JSON.parse(event.body);
        const { primaryContactEmail: email } = body.canonicalResellerDetails;

        const userExist = await canonicalReseller.getUser(email);
        if (userExist) {
            return response('User already exists with email provided.', 400);
        }

        const canonicalResellerId = await canonicalReseller.createNewCanonicalReseller(event, resellerId);

        return response({ canonicalResellerId: canonicalResellerId }, 200);
    } catch (err) {
        console.error(err);
        return response(err.message || 'An error occurred, please contact support or try again', 500);
    }
}).use(userTypesValidatorMiddleware([UserType.ADMIN]));
