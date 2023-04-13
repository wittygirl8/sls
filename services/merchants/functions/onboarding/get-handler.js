require('dotenv').config();

var { response, middy, userAccessValidatorMiddleware } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { OnboardingService } = require('../../business-logic/onboarding.service');

const onboardingService = new OnboardingService();

export const onboardingGet = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;
        const onboardingStep = event.pathParameters.onboardingStep;

        var merchantData;
        switch (onboardingStep) {
            case '1': {
                merchantData = await onboardingService.GetNameAndAddress(merchantId);
                break;
            }
            case '2': {
                merchantData = await onboardingService.GetBusinessDetail(merchantId);
                break;
            }
            case '3': {
                merchantData = await onboardingService.GetTradingAndAddress(merchantId);
                break;
            }
            case '4': {
                merchantData = await onboardingService.GetOwnerDetailsAndAddress(merchantId);
                break;
            }
            case '5': {
                merchantData = await onboardingService.GetBusinessProfile(merchantId);
                break;
            }
            case '6': {
                merchantData = await onboardingService.GetTransactionProfile(merchantId);
                break;
            }
            case '7': {
                merchantData = await onboardingService.GetProductsRequired(merchantId);
                break;
            }
            default: {
                return response({}, 400);
            }
        }

        if (!merchantData) return response({}, 404);
        return response(merchantData, 200);
    } catch (error) {
        console.log(error);
        return response({}, 500);
    }
}).use(userAccessValidatorMiddleware());
