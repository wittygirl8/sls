require('dotenv').config();

const { response } = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');
const { BankService } = require('../../business-logic/bank.service');

const bankService = new BankService();

export const validateBankDetails = async (event) => {
    try {
        const body = JSON.parse(event.body);
        let result = await bankService.validateDetails(body);

        if (result.data.Items[0].Error) {
            return response(result.data.Items[0].Error, 400);
        }

        return response(result.data.Items[0], 200);
    } catch (error) {
        console.log(error);
        return response({}, 500);
    }
};
