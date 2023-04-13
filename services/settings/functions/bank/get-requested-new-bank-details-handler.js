require('dotenv').config();

const { response, middy, userAccessValidatorMiddleware } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');

const { BankService } = require('../../business-logic/bank.service');

const bankService = new BankService();

export const getRequestedNewBankDetails = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;

        // const body = JSON.parse(event.body);

        let bankDetails = await bankService.getRequestedNewBankDetails(merchantId);

        if (!bankDetails) return response({}, 404);

        return response(bankDetails, 200);
    } catch (error) {
        console.log(error);
        return response({}, 500);
    }
}).use(userAccessValidatorMiddleware());
