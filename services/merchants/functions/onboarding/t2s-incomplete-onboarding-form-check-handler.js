require('dotenv').config();

var { response, middy, userAccessValidatorMiddleware } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { OnboardingService } = require('../../business-logic/onboarding.service');
var { MerchantService } = require('../../business-logic/merchant.service');

const {
    onboardingRequiredFields,
    defaultSoleTraderStep,
    registeredBusinessSoleTraderStep,
    notRegBankAccountSoleTraderStep,
    tradingAddressSoleTrader
} = require('../../helpers/onboardingRequiredFields');

const onboardingService = new OnboardingService();
const merchantService = new MerchantService();

export const t2sIncompleteOnboardingFormCheck = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;

        const merchant = await merchantService.getById(merchantId);
        const merchantNameAndAddress = await onboardingService.GetNameAndAddress(merchantId);
        const merchantBusinessDetail = await onboardingService.GetBusinessDetail(merchantId);
        const merchantTradingAndAddress = await onboardingService.GetTradingAndAddress(merchantId);
        const merchantOwnerDetailAndAddress = await onboardingService.GetOwnerDetailsAndAddress(merchantId);
        const ownersDetails = merchantOwnerDetailAndAddress ? merchantOwnerDetailAndAddress.ownersDetails : null;
        const ownerPrimaryAddress = merchantOwnerDetailAndAddress ? merchantOwnerDetailAndAddress.addressData : null;
        const inCompleteSteps = [];

        const nameAndAddressCompleteFields = {
            ...merchantBusinessDetail,
            ...merchantNameAndAddress,
            accountHolderName: merchantTradingAndAddress.accountHolderName
                ? merchantTradingAndAddress.accountHolderName
                : null
        };
        const tradingAddressCompleteFields = {
            ...merchantTradingAndAddress,
            tradingName: merchantBusinessDetail.tradingName
        };
        const ownerDetailsCompleteFields = { ...ownersDetails, ...ownerPrimaryAddress };

        const t2sRequiredFields = onboardingRequiredFields.Datman.filter((data) => data.country === merchant.country)[0]
            .steps;

        let nameAndAddressIncompleteFields = [];
        let checkNameAndAddressComplete = true;
        let nameAndAddressStep = t2sRequiredFields.nameAndAddressFields;
        if (nameAndAddressCompleteFields.businessTypeId === 2) {
            if (nameAndAddressCompleteFields.isRegisteredBusiness) {
                nameAndAddressStep = registeredBusinessSoleTraderStep;
            } else if (
                !nameAndAddressCompleteFields.isRegisteredBusiness &&
                !nameAndAddressCompleteFields.isAccountNameSame
            ) {
                nameAndAddressStep = notRegBankAccountSoleTraderStep;
            } else {
                nameAndAddressStep = defaultSoleTraderStep;
            }
        }

        for (let i = 0; i < nameAndAddressStep.length; i++) {
            checkNameAndAddressComplete =
                checkNameAndAddressComplete && nameAndAddressCompleteFields[nameAndAddressStep[i]];
            if (!nameAndAddressCompleteFields[nameAndAddressStep[i]]) {
                nameAndAddressIncompleteFields = [...nameAndAddressIncompleteFields, nameAndAddressStep[i]];
            }
            checkNameAndAddressComplete = checkNameAndAddressComplete ? true : false;
        }
        !checkNameAndAddressComplete && inCompleteSteps.push(1);

        let bankDetailsIncompleteFields = [];
        let checkBankDetailsComplete = true;
        const bankDetailStep = t2sRequiredFields.bankDetailsFields;

        for (let i = 0; i < bankDetailStep.length; i++) {
            checkBankDetailsComplete = checkBankDetailsComplete && tradingAddressCompleteFields[bankDetailStep[i]];
            if (!tradingAddressCompleteFields[bankDetailStep[i]]) {
                bankDetailsIncompleteFields = [...bankDetailsIncompleteFields, bankDetailStep[i]];
            }
            checkBankDetailsComplete = checkBankDetailsComplete ? true : false;
        }
        !checkBankDetailsComplete && inCompleteSteps.push(2);

        let tradingAddressIncompleteFields = [];
        let checkTradingAddressComplete = true;
        const tradingAddressStep =
            nameAndAddressCompleteFields.businessTypeId === 2
                ? tradingAddressSoleTrader
                : t2sRequiredFields.tradingAddressFields;

        for (let i = 0; i < tradingAddressStep.length; i++) {
            checkTradingAddressComplete =
                checkTradingAddressComplete && tradingAddressCompleteFields[tradingAddressStep[i]];
            if (!tradingAddressCompleteFields[tradingAddressStep[i]]) {
                tradingAddressIncompleteFields = [...tradingAddressIncompleteFields, tradingAddressStep[i]];
            }
            checkTradingAddressComplete = checkTradingAddressComplete ? true : false;
        }
        !checkTradingAddressComplete && inCompleteSteps.push(3);

        let ownerDetailsIncompleteFields = [];
        let checkOwnerDetailsComplete = true;
        const ownerDetailsStep = t2sRequiredFields.ownerDetailsFields;

        for (let i = 0; i < ownerDetailsStep.length; i++) {
            checkOwnerDetailsComplete = checkOwnerDetailsComplete && ownerDetailsCompleteFields[ownerDetailsStep[i]];
            if (!ownerDetailsCompleteFields[ownerDetailsStep[i]]) {
                ownerDetailsIncompleteFields = [...ownerDetailsIncompleteFields, ownerDetailsStep[i]];
            }
            checkOwnerDetailsComplete = checkOwnerDetailsComplete ? true : false;
        }
        !checkOwnerDetailsComplete && inCompleteSteps.push(4);

        const validOnboardingFrom =
            checkNameAndAddressComplete &&
            checkBankDetailsComplete &&
            checkTradingAddressComplete &&
            checkOwnerDetailsComplete;

        return response(
            {
                validOnboardingFrom: validOnboardingFrom,
                nameAndAddressIncompleteFields: nameAndAddressIncompleteFields,
                bankDetailsIncompleteFields: bankDetailsIncompleteFields,
                tradingAddressIncompleteFields: tradingAddressIncompleteFields,
                ownerDetailsIncompleteFields: ownerDetailsIncompleteFields,
                inCompleteSteps: inCompleteSteps
            },
            200
        );
    } catch (error) {
        console.error(error);
        return response({}, 500);
    }
}).use(userAccessValidatorMiddleware());
