require('dotenv').config();

var { response, middy, userTypesValidatorMiddleware, models } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../../layers/models_lib/src') : require('models');
var { MerchantService } = require('../../business-logic/merchant.service');
var { ExternalMerchantIdsService } = require('../../business-logic/external-merchant-ids-relationship.service');
var { PaymentsConfigurationRepo } = require('../../../../libs/repo/payments-configuration.repo');
var { AcquirerAccountConfigurationRepo } = require('../../../../libs/repo/acquirer-account-configuration-repo');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

const { UserType } = models;
const merchantService = new MerchantService();
const externalMerchantIdsService = new ExternalMerchantIdsService();
const paymentsConfigurationRepo = new PaymentsConfigurationRepo(db);
const acquirerAccountConfigurationRepo = new AcquirerAccountConfigurationRepo(db);
const { Op } = db.Sequelize;

export const getMerchantDataForAdmin = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;

        const merchant = await merchantService.getById(merchantId);

        if (!merchant) {
            return response({}, 404);
        }

        const externalMerchantIds = await externalMerchantIdsService.findByMerchantId(merchantId);
        const merchantIdsObj = externalMerchantIds.filter((externalMerchantId) => {
            return externalMerchantId.externalMerchantId;
        });
        const merchantIds = [];
        merchantIdsObj.map((merchantIdObj) => {
            merchantIds[merchantIdObj.orderNumber] = merchantIdObj.externalMerchantId;
        });

        const merchantStoreIdsObj = externalMerchantIds.filter((externalMerchantId) => {
            return externalMerchantId.externalMerchantStoreId;
        });
        const merchantStoreIds = [];
        merchantStoreIdsObj.map((merchantStoreIdObj) => {
            merchantStoreIds[merchantStoreIdObj.orderNumber] = merchantStoreIdObj.externalMerchantStoreId;
        });

        const paymentsConfiguration = await paymentsConfigurationRepo.findOne({
            where: { merchantId: merchantId }
        });

        const acquirerAccounts = await acquirerAccountConfigurationRepo.findAll({
            where: { merchantId: merchantId, acquirer: { [Op.in]: ['DNA', 'Adyen'] } },
            attributes: ['adyenSubAccountId', 'dnaApplicationId', 'acquirer']
        });
        const dnaAcquirerAccount = acquirerAccounts.filter((item) => item.acquirer === 'DNA');
        const adyenAcquirerAccount = acquirerAccounts.filter((item) => item.acquirer === 'Adyen');

        const data = {
            merchantId: merchantId,
            name: merchant.name,
            status: merchant.status,
            bankVerify: merchant.isBankAccountVerified,
            accountVerify: merchant.isAccountVerified,
            merchantIds: merchantIds,
            merchantStoreIds: merchantStoreIds,
            internalTransferStatus: merchant.internalTransferStatus,
            thirdPartyCustomerId: merchant.thirdPartyCustomer,
            allowWithdrawals: merchant.allowWithdrawals,
            stripeId: merchant.stripeId,
            country: merchant.country,
            isTestMerchant: merchant.isTestMerchant,
            testMode: paymentsConfiguration?.testMode,
            threeDSecure: paymentsConfiguration?.threeDSecure,
            adyenAccountId: adyenAcquirerAccount.length > 0 ? adyenAcquirerAccount[0].adyenSubAccountId : null,
            autoWithdraw: merchant.autoWithdraw,
            isReceiptEnabled: merchant.isReceiptEnabled,
            isInvoiceEnabled: merchant.isInvoiceEnabled,
            dnaApplicationId: dnaAcquirerAccount.length > 0 ? dnaAcquirerAccount[0].dnaApplicationId : null
        };

        return response(data);
    } catch (err) {
        console.error(err);
        return response({}, 500);
    }
}).use(userTypesValidatorMiddleware([UserType.ADMIN, UserType.RESELLER]));
