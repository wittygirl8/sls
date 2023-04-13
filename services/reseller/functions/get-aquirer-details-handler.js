var { response, middy, userAccessValidatorMiddleware } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { CanonicalReseller } = require('../business-logic/canonical-reseller');

const canonicalReseller = new CanonicalReseller();

export const getAquirerDetails = middy(async (event) => {
    try {
        const canonicalResellerId = event.pathParameters.canonicalResellerId;
        const merchantId = event.pathParameters.merchantId;
        const allAquirerDetails = await canonicalReseller.getAquirerDetails(canonicalResellerId, merchantId);

        return response(allAquirerDetails);
    } catch (err) {
        console.log(err);
        return response(err || 'An error occurred, please contact support or try again', 500);
    }
}).use(userAccessValidatorMiddleware());
