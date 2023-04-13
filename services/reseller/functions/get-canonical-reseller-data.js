var { response, middy, userTypesValidatorMiddleware, models } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { CanonicalReseller } = require('../business-logic/canonical-reseller');

const canonicalReseller = new CanonicalReseller();
const { UserType } = models;

export const getCanonicalResellerData = middy(async (event) => {
    try {
        const canonicalResellerId = event.pathParameters.canonicalResellerId;
        const canonicalResellersData = await canonicalReseller.getCanonicalResellerData(canonicalResellerId);

        return response(canonicalResellersData, 200);
    } catch (err) {
        console.log(err);
        return response(err || 'An error occurred, please contact support or try again', 500);
    }
}).use(userTypesValidatorMiddleware([UserType.RESELLER]));
