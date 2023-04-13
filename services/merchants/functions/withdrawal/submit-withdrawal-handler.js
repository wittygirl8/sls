'use strict';
require('dotenv').config();
global.fetch = require('node-fetch').default;

import { WithdrawalService } from '../../business-logic/withdrawal.service';
var { response, middy, userAccessValidatorMiddleware } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');

const withdrawalService = new WithdrawalService();

/**
 * @description Submitting a withdrawal
 * @param { {} } event Request event
 */
export const submitWithdrawal = middy(async (event) => {
    try {
        await withdrawalService.SubmitWithdrawal(event);
        return response({}, 200);
    } catch (error) {
        return response({ error: error }, 500);
    }
}).use(userAccessValidatorMiddleware());
