var { response, middy, userAccessValidatorMiddleware } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { BusinessDetailsService } = require('../../business-logic/business-details.service');
var { EmailNotifyUpdateService } = require('../../business-logic/email-notify-update.service');

const businessDetailsService = new BusinessDetailsService();
const emailNotifyUpdateService = new EmailNotifyUpdateService();
export const updateBusinessDetails = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;
        const body = JSON.parse(event.body);

        await emailNotifyUpdateService.send(merchantId, body.resellerId, body.updatedAccountDetails);

        const updateResponse = await businessDetailsService.updateBusinessDetails(merchantId, body);
        return response(updateResponse);
    } catch (error) {
        console.error(error);
        return response({}, 500);
    }
}).use(userAccessValidatorMiddleware());
