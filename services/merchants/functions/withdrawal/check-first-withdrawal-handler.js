'use strict';
require('dotenv').config();
global.fetch = require('node-fetch').default;

import { WithdrawalService } from '../../business-logic/withdrawal.service';
var { response } = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');

const withdrawalService = new WithdrawalService();

export const checkFirstWithdrawal = async (event) => {
    try {
        const response = await withdrawalService.CheckFirstWithdrawal(event);
        return response;
    } catch (error) {
        return response({ error: error }, 500);
    }
};
