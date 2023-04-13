require('dotenv').config();

const { response, middy, userAccessValidatorMiddleware, getUserId } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');

const { BankService } = require('../../business-logic/bank.service');
const { EmailNotifyRejectBankUpdateService } = require('../../business-logic/email-notify-reject-bank-update.service');

const bankService = new BankService();
const emailNotifyRejectBankUpdateService = new EmailNotifyRejectBankUpdateService();

export const RejectUpdateRequest = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;
        const userId = await getUserId(event);
        const body = JSON.parse(event.body);

        let bankDetails = await bankService.RejectUpdateBankDetailsRequest(merchantId, body.documentId, event, userId);

        if (!bankDetails) return response({}, 404);
        await emailNotifyRejectBankUpdateService.send(merchantId, body.resellerId, body.notes);

        return response({}, 200);
    } catch (error) {
        console.log(error);
        return response({}, 500);
    }
}).use(userAccessValidatorMiddleware());
