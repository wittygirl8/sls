require('dotenv').config();

const { response, middy, userAccessValidatorMiddleware } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');

const { BankService } = require('../../business-logic/bank.service');

const bankService = new BankService();

export const getBankDetails = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;

        const bankDetails = await bankService.GetBankDetails(merchantId);

        if (!bankDetails) {
            return response({}, 404);
        }

        return response(bankDetails);
    } catch (err) {
        console.log(err);
        return response({}, 500);
    }
}).use(userAccessValidatorMiddleware());

export const getMaskedBankDetails = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;
        const bankDetails = await bankService.GetBankDetails(merchantId);
        if (!bankDetails) {
            return response({}, 404);
        }

        const asterisks = '******';
        const absencePlaceholder = '***';
        const numberOfLastCharactersToShow = 3;

        const maskedSortCode =
            bankDetails.sortCode && bankDetails.sortCode.length >= numberOfLastCharactersToShow
                ? `${asterisks}${bankDetails.sortCode.slice(
                      bankDetails.sortCode.length - numberOfLastCharactersToShow
                  )}`
                : `${asterisks}${absencePlaceholder}`;

        const maskedAccountNumber =
            bankDetails.newAccountNumber && bankDetails.newAccountNumber.length >= numberOfLastCharactersToShow
                ? `${asterisks}${bankDetails.newAccountNumber.slice(
                      bankDetails.newAccountNumber.length - numberOfLastCharactersToShow
                  )}`
                : `${asterisks}${absencePlaceholder}`;

        const maskedBsbCode =
            bankDetails.bsb && bankDetails.bsb.length >= numberOfLastCharactersToShow
                ? `${asterisks}${bankDetails.bsb.slice(bankDetails.bsb.length - numberOfLastCharactersToShow)}`
                : `${asterisks}${absencePlaceholder}`;

        const maskedRoutingNumber =
            bankDetails.routingNumber && bankDetails.routingNumber.length >= numberOfLastCharactersToShow
                ? `${asterisks}${bankDetails.routingNumber.slice(
                      bankDetails.routingNumber.length - numberOfLastCharactersToShow
                  )}`
                : `${asterisks}${absencePlaceholder}`;

        const maskedBankDetails = {
            sortCode: maskedSortCode,
            accountNumber: maskedAccountNumber,
            bsbCode: maskedBsbCode,
            routingNumber: maskedRoutingNumber
        };

        return response(maskedBankDetails);
    } catch (err) {
        console.log(err);
        return response({}, 500);
    }
}).use(userAccessValidatorMiddleware());
