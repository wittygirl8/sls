require('dotenv').config();

const { response, getUserId, middy, userTypesValidatorMiddleware, models } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');

const { BankService } = require('../../business-logic/bank.service');
const {
    EmailNotifyApproveBankUpdateService
} = require('../../business-logic/email-notify-approve-bank-update.service');

const { UserType } = models;

const bankService = new BankService();
const emailNotifyApproveBankUpdateService = new EmailNotifyApproveBankUpdateService();

export const updateBankDetails = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;
        const userId = await getUserId(event);

        const body = JSON.parse(event.body);
        const bankDetails = await bankService.UpdateBankDetails(
            merchantId,
            userId,
            body.documentId,
            event,
            body.resellerId
        );
        if (!bankDetails) return response({}, 404);
        await emailNotifyApproveBankUpdateService.send(merchantId, body.resellerId, bankDetails.dataValues.sortCode);

        return response({}, 200);
    } catch (error) {
        console.log(error);
        return response({}, 500);
    }
}).use(userTypesValidatorMiddleware([UserType.ADMIN]));
