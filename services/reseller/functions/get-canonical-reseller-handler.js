var { response, middy, userTypesValidatorMiddleware, models } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { CanonicalReseller } = require('../business-logic/canonical-reseller');

const canonicalReseller = new CanonicalReseller();
const { UserType } = models;

export const getCanonicalReseller = middy(async (event) => {
    try {
        const resellerId = event.pathParameters.resellerId;
        const body = JSON.parse(event.body);
        const { searchValue, offset, limit } = body;
        const allCanonicalResellers = await canonicalReseller.getAllCanonicalResellers(
            resellerId,
            searchValue,
            offset,
            limit
        );

        return response(allCanonicalResellers);
    } catch (err) {
        console.log(err);
        return response(err || 'An error occurred, please contact support or try again', 500);
    }
}).use(userTypesValidatorMiddleware([UserType.RESELLER]));
