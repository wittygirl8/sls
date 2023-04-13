require('dotenv').config();

const { response, middy, userAccessValidatorMiddleware, getUserId } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');

const { BankService } = require('../../business-logic/bank.service');
var { EmailNotifyUpdateService } = require('../../business-logic/email-notify-update.service');

const bankService = new BankService();
const emailNotifyUpdateService = new EmailNotifyUpdateService();

export const updateBankDetailsRequest = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;
        const body = JSON.parse(event.body);
        const userId = await getUserId(event);

        let bankDetails = await bankService.RequestForUpdateBankDetails(merchantId, body, event, userId);

        if (bankDetails?.message) {
            return response({ message: bankDetails.message }, 405);
        }

        if (!bankDetails) return response({}, 404);

        await emailNotifyUpdateService.send(merchantId, body.resellerId);

        return response({}, 200);
    } catch (error) {
        console.log(error);
        return response({}, 500);
    }
}).use(userAccessValidatorMiddleware());
