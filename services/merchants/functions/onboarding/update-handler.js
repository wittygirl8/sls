require('dotenv').config();

var { response, middy, userAccessValidatorMiddleware, getUserDetails } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { OnboardingService } = require('../../business-logic/onboarding.service');

const onboardingService = new OnboardingService();

export const onboardingUpdate = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;
        const onboardingStep = event.pathParameters.onboardingStep;

        const body = JSON.parse(event.body);
        const useDetails = await getUserDetails(event);
        const userId = useDetails.userId;
        if (body) {
            body.userType = useDetails.userType;
        }

        var merchant;
        switch (onboardingStep) {
            case '1': {
                merchant = await onboardingService.UpdateNameAndAddress(merchantId, body, event, userId);
                break;
            }
            case '2': {
                merchant = await onboardingService.UpdateBusinessDetail(merchantId, body, event, userId);
                break;
            }
            case '3': {
                merchant = await onboardingService.UpdateTradingAddress(merchantId, body, event, userId);
                break;
            }
            case '4': {
                if (body.subStepNumber === 1) {
                    merchant = await onboardingService.UpdateOwnerDetails(merchantId, body, event, userId);
                    break;
                } else if (body.subStepNumber === 2) {
                    merchant = await onboardingService.UpdateOwnerAddress(merchantId, body, event, userId);
                    break;
                } else {
                    return response({}, 404);
                }
            }
            case '5': {
                merchant = await onboardingService.UpdateBusinessProfile(merchantId, body, event, userId);
                break;
            }
            case '6': {
                merchant = await onboardingService.UpdateTransactionProfile(merchantId, body, event, userId);
                break;
            }
            case '7': {
                merchant = await onboardingService.AddProductsRequired(merchantId, body, event, userId);
                break;
            }
            case '8': {
                merchant = await onboardingService.updateDocuments(merchantId, event, userId);
                break;
            }
            default: {
                return response({}, 400);
            }
        }

        if (merchant?.message) {
            return response({ message: merchant.message }, 405);
        }

        if (!merchant) return response({}, 404);
        return response({}, 200);
    } catch (error) {
        console.log(error);
        return response({}, 500);
    }
}).use(userAccessValidatorMiddleware());
