require('dotenv').config();

var { response, getUserId } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { MerchantService } = require('../business-logic/merchant.service');
var { RefferalDataService } = require('../business-logic/referal-data.service');

const merchantService = new MerchantService();
const referralDataService = new RefferalDataService();

export const getUserMerchants = async (event) => {
    try {
        const userId = await getUserId(event);
        const resellerId = event.pathParameters.resellerId;

        const merchants = await merchantService.getUserMerchants(userId, resellerId);
        const referralDataString = await referralDataService.getReferralDataString(userId);
        const merchantTAndCMap = await merchantService.countOfTermsAndConditionForMerchant(merchants);

        const merchantsDto = merchants?.map((merchant) => {
            let merchantData = JSON.parse(JSON.stringify(merchant));
            const acquirerAccountConfiguration =
                merchantData.AcquirerAccountConfigurations && merchantData.AcquirerAccountConfigurations[0];
            const OwnerDetails = merchantData.OwnersDetail;
            return {
                id: merchant.id,
                name: merchant.name,
                status: merchant.status,
                country: merchant.country,
                userRole: merchant.Relationships.find((relation) => relation.merchantId === merchant.id).Role.name,
                merchantProductRequired: merchant.MerchantProductRequireds.map((product) => ({
                    id: product.productRequiredId,
                    productName: product.ProductRequired.name,
                    status: product.status,
                    additionalInfo: product.additionalInfo
                })),
                label: merchant.label,
                onboardingStep: merchant.onboardingStep,
                internalTransferStatus: merchant.internalTransferStatus,
                merchantBunkStatus: merchant.BusinessBankDetail ? merchant.BusinessBankDetail.status : null,
                isClosureRequested: merchant.isClosureRequested,
                allowWithdrawals: merchant.allowWithdrawals,
                createdAt: merchant.createdAt,
                businessTypeId: merchant.BusinessDetail ? merchant.BusinessDetail.businessTypeId : null,
                vatNumber: merchant.BusinessDetail ? merchant.BusinessDetail.vatNumber : null,
                signupLinkFrom: merchant.signupLinkFrom,
                isStripe: merchant.stripeId ? true : false,
                canonicalResellerId: merchant.canonicalResellerId,
                ...merchantTAndCMap[merchant.id],
                merchantQrId: merchant.merchantQrId,
                isTestMerchant: merchant.isTestMerchant,
                autoWithdraw: merchant.autoWithdraw,
                isReceiptEnabled: merchant.isReceiptEnabled,
                isAdyenMerchant: acquirerAccountConfiguration
                    ? acquirerAccountConfiguration.adyenSubAccountId
                        ? true
                        : false
                    : false,
                isDna: acquirerAccountConfiguration ? (acquirerAccountConfiguration.dnaMid ? true : false) : false,
                payoutStatus: acquirerAccountConfiguration && acquirerAccountConfiguration.payoutStatus,
                accountStatus: acquirerAccountConfiguration && acquirerAccountConfiguration.accountStatus,
                isPushNotificationEnabled: merchant.isPushNotificationEnabled,
                email: OwnerDetails ? OwnerDetails.email : null,
                phoneNumber: OwnerDetails ? OwnerDetails.contactPhone : null,
                merchantType: merchant.merchantType,
                isInvoiceEnabled: merchant.isInvoiceEnabled
            };
        });

        const data = {
            merchantsDto: merchantsDto,
            referralDataString: referralDataString,
            InCompleteOnboardingMerchants: process.env.INCOMPLETE_ONBOARDING_MERCHANTS || null
        };
        return response(data);
    } catch (err) {
        console.error(err);
        return response({}, 500);
    }
};
