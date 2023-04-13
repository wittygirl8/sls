'use strict';
require('dotenv').config();
global.fetch = require('node-fetch').default;

import { InternalTransferService } from '../../business-logic/internal-transfer.service';
var { response, middy, userAccessValidatorMiddleware } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');

const internalTransferService = new InternalTransferService();

/**
 * @description Submitting an internal transfer
 * @param { {} } event Request event
 */
export const submitInternalTransfer = middy(async (event) => {
    try {
        await internalTransferService.SubmitInternalTransfer(event);

        return response({}, 200);
    } catch (error) {
        console.log(error);
        return response({ error: error }, 500);
    }
}).use(userAccessValidatorMiddleware());
