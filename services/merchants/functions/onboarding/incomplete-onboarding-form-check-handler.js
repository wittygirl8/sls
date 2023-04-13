require('dotenv').config();

var { response, middy, userAccessValidatorMiddleware } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { OnboardingService } = require('../../business-logic/onboarding.service');
const { OnboardingFormStatus } = require('../../helpers/OnboardingFormStatus');

const onboardingService = new OnboardingService();
export const incompleteOnBordingFormCheck = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;

        const merchantNameAndAddress = await onboardingService.GetNameAndAddress(merchantId);
        const merchantBusinessDetail = await onboardingService.GetBusinessDetail(merchantId);
        const merchantTradingAndAddress = await onboardingService.GetTradingAndAddress(merchantId);
        const merchantOwnerDetailAndAddress = await onboardingService.GetOwnerDetailsAndAddress(merchantId);
        const ownersDetails = merchantOwnerDetailAndAddress ? merchantOwnerDetailAndAddress.ownersDetails : null;
        const ownerPrimaryAddress = merchantOwnerDetailAndAddress ? merchantOwnerDetailAndAddress.addressData : null;
        const businessProfileData = await onboardingService.GetBusinessProfile(merchantId);
        const transactionProfileData = await onboardingService.GetTransactionProfile(merchantId);
        const merchantProducts = await onboardingService.GetProductsRequired(merchantId);

        if (
            !merchantNameAndAddress ||
            !merchantBusinessDetail ||
            !merchantTradingAndAddress ||
            !businessProfileData ||
            !merchantProducts ||
            !ownersDetails ||
            !ownerPrimaryAddress ||
            !transactionProfileData ||
            !(transactionProfileData.companyTurnOverActual !== null)
        ) {
            return response({}, 404);
        }

        return response({ formStatus: OnboardingFormStatus.IN_PROGRESS }, 200);
    } catch (error) {
        console.error(error);
        return response({}, 500);
    }
}).use(userAccessValidatorMiddleware());
