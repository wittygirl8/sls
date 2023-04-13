require('dotenv').config();

var { response, middy, userAccessValidatorMiddleware } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { OnboardingService } = require('../../business-logic/onboarding.service');

const onboardingService = new OnboardingService();

export const onboardingFullData = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;

        const nameAndAddress = await onboardingService.GetNameAndAddress(merchantId);
        const businessDetails = await onboardingService.GetBusinessDetail(merchantId);
        const tradingAddress = await onboardingService.GetTradingAndAddress(merchantId);
        const ownersDetailsAndAddress = await onboardingService.GetOwnerDetailsAndAddress(merchantId);
        const ownersDetails = ownersDetailsAndAddress ? ownersDetailsAndAddress.ownersDetails : null;
        const ownerPrimaryAddress = ownersDetailsAndAddress ? ownersDetailsAndAddress.addressData : null;
        const businessProfile = await onboardingService.GetBusinessProfile(merchantId);
        const transactionProfileData = await onboardingService.GetTransactionProfile(merchantId);
        const transactionProfile = transactionProfileData
            ? {
                  stepOne: {
                      isDepositsTaken: transactionProfileData.isDepositsTaken,
                      goods: transactionProfileData.goods,
                      cardTurnover: transactionProfileData.cardTurnover,
                      depositFarDays: transactionProfileData.depositFarDays,
                      noDeliveryDays: transactionProfileData.noDeliveryDays,
                      isPrePayment: transactionProfileData.isPrePayment,
                      fullPrePayments: transactionProfileData.fullPrePayments,
                      advanceFullPaymentsDays: transactionProfileData.advanceFullPaymentsDays
                  },
                  stepTwo: {
                      companyTurnOverActual: transactionProfileData.companyTurnOverActual,
                      companyTurnOverProjected: transactionProfileData.companyTurnOverProjected,
                      cardTurnOverActual: transactionProfileData.cardTurnOverActual,
                      cardTurnOverProjected: transactionProfileData.cardTurnOverProjected,
                      priceRangeMin: transactionProfileData.priceRangeMin,
                      priceRangeMax: transactionProfileData.priceRangeMax,
                      priceRangeAvg: transactionProfileData.priceRangeAvg
                  },
                  stepThree: {
                      isMotoPayment: transactionProfileData.isMotoPayment,
                      isMaxTicketApplied: transactionProfileData.isMaxTicketApplied,
                      maxTicketValue: transactionProfileData.maxTicketValue,
                      totalCardTurnoverIsMoto: transactionProfileData.totalCardTurnoverIsMoto,
                      advanceGoodsMotoProvidedDays: transactionProfileData.advanceGoodsMotoProvidedDays,
                      isAutoRenewTransactions: transactionProfileData.isAutoRenewTransactions,
                      motoRenewalReason: transactionProfileData.motoRenewalReason
                  }
              }
            : null;
        const selectedProducts = await onboardingService.GetProductsRequired(merchantId);

        const merchantData = {
            nameAndAddress,
            businessDetails,
            tradingAddress,
            ownersDetails,
            ownerPrimaryAddress,
            businessProfile,
            transactionProfile,
            selectedProducts
        };

        return response({ merchantData }, 200);
    } catch (error) {
        console.error(error);
        return response({}, 500);
    }
}).use(userAccessValidatorMiddleware());
