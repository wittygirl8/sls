require('dotenv').config();

var { response, middy, userTypesValidatorMiddleware, models } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');

var { EmailNotifyAdminRejectMerchant } = require('../../business-logic/email-notify-admin-reject-merchant.service');
const emailNotifyAdminRejectMerchant = new EmailNotifyAdminRejectMerchant();
const { UserType } = models;

export const MerchantRejectHandler = middy(async (event) => {
    try {
        const body = JSON.parse(event.body);
        const resellerId = body.resellerId;
        const merchantId = body.merchantId;
        const isPep = body.isPep;
        const notes = body.notes;
        await emailNotifyAdminRejectMerchant.send(resellerId, merchantId, isPep, notes);
        return response({});
    } catch (err) {
        console.error(err);
        return response({}, 500);
    }
}).use(userTypesValidatorMiddleware([UserType.ADMIN]));
