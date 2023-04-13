var { response, middy, userTypesValidatorMiddleware, models } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
const { UserType } = models;
var { CanonicalReseller } = require('../business-logic/canonical-reseller');
var { EmailNotifyUpdateCanonicalResellerService } = require('../business-logic/email-notify');

const canonicalReseller = new CanonicalReseller();
const emailNotifyUpdateCanonicalResellerService = new EmailNotifyUpdateCanonicalResellerService();
export const updateCanonicalResellerData = middy(async (event) => {
    try {
        const canonicalResellerId = event.pathParameters.canonicalResellerId;
        const body = JSON.parse(event.body);
        const resellerId = body.resellerId;
        const canonicalResellerDetails = body.canonicalResellerDetails;
        const updateCanonicalResellerDetails = body.updateCanonicalResellerDetails;
        await canonicalReseller.updateCanonicalResellerData(canonicalResellerId, canonicalResellerDetails);
        if (resellerId) {
            await emailNotifyUpdateCanonicalResellerService.send(
                canonicalResellerId,
                resellerId,
                updateCanonicalResellerDetails
            );
        }

        return response({}, 200);
    } catch (err) {
        console.log(err);
        return response(err || 'An error occurred, please contact support or try again', 500);
    }
}).use(userTypesValidatorMiddleware([UserType.RESELLER]));
