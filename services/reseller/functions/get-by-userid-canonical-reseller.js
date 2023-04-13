var { response, getUserId, middy, userTypesValidatorMiddleware, models } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { CanonicalReseller } = require('../business-logic/canonical-reseller');
const { UserType } = models;

const canonicalReseller = new CanonicalReseller();
export const getCanonicalResellerUser = middy(async (event) => {
    try {
        const userId = await getUserId(event);
        const canonicalResellersBasicInfo = await canonicalReseller.getCanonicalResellersByUserId(userId);
        const canonicalResellersData = canonicalResellersBasicInfo.canonicalResellers;
        const userRole = canonicalResellersBasicInfo.userRole;
        const termsAndConditionInfo = await canonicalReseller.getAllTermsAndConditions(canonicalResellersData);

        const canonicalResellersDto = canonicalResellersData?.map((canonicalReseller) => ({
            ...JSON.parse(JSON.stringify(canonicalReseller)),
            userRole: userRole,
            termsAndConditionInfo: termsAndConditionInfo[canonicalReseller.id]
        }));

        const data = {
            canonicalResellers: canonicalResellersDto
        };

        return response(data);
    } catch (err) {
        console.log(err);
        return response(err || 'An error occurred, please contact support or try again', 500);
    }
}).use(userTypesValidatorMiddleware([UserType.RESELLER]));
