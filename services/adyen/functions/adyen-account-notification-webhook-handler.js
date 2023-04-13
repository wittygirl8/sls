'use strict';
var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
const { AdyenService } = require('../business-logic/adyen.service');
const adyenService = new AdyenService();

export const adyenAccountNotificationWebhookHandler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        console.log(body);
        const { eventType, content } = body;
        const accountHolderCode = content.accountHolderCode;
        const accountCode = content.accountCode;

        if (eventType === 'ACCOUNT_HOLDER_CREATED' || eventType === 'ACCOUNT_HOLDER_UPDATED') {
            const allowPayout = content.accountHolderStatus.payoutState.allowPayout;
            const status = content.accountHolderStatus.status;
            if (eventType === 'ACCOUNT_HOLDER_CREATED') {
                await adyenService.accountHolderCreatedWebhook(accountHolderCode, accountCode, status, allowPayout);
                throw { message: `ACCOUNT_HOLDER_CREATED event ocurred` };
            }
            if (eventType === 'ACCOUNT_HOLDER_UPDATED') {
                await adyenService.accountHolderUpdatedWebhook(accountHolderCode, status, allowPayout);
                throw { message: `ACCOUNT_HOLDER_UPDATED event ocurred` };
            }
        }
        if (eventType === 'ACCOUNT_HOLDER_STATUS_CHANGE') {
            const allowPayout = content.newStatus.payoutState.allowPayout;
            const status = content.newStatus.status;
            await adyenService.accountHolderStatusChange(accountHolderCode, status, allowPayout);
            throw { message: `ACCOUNT_HOLDER_STATUS_CHANGE event ocurred` };
        }
        if (eventType === 'ACCOUNT_HOLDER_VERIFICATION') {
            const type = content.kycCheckStatusData.type;
            const status = content.kycCheckStatusData.status;
            await adyenService.accountHolderVerificationWebhook(accountHolderCode, type, status);

            throw { message: `ACCOUNT_HOLDER_VERIFICATION event ocurred` };
        }
        return response('[accepted]');
    } catch (err) {
        console.error(err);
        return response('[accepted]');
    }
};
