'use strict';
const { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
const { DnaVerifyApplicationService } = require('../business-logic/dna-verify-application.service');
const dnaVerifyApplicationService = new DnaVerifyApplicationService();

export const dnaCallBackUrl = async (event) => {
    try {
        const payload = event.body;
        const eventPayload = event;
        const merchantId = event.pathParameters.merchantId;
        if (payload) {
            const verifyService = await dnaVerifyApplicationService.updateApplicationStatus(
                merchantId,
                payload,
                eventPayload
            );
            return response({
                message: verifyService.message,
                status: verifyService.status
            });
        } else {
            return response({
                message: 'No Payload found'
            });
        }
    } catch (error) {
        console.error('Dna response error', error);
        return response(error, 500);
    }
};
