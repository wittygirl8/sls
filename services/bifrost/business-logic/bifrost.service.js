var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');

const {
    MerchantRepo,
    RelationshipRepo,
    AcquirerAccountConfigurationRepo,
    DnaMerchantMetadataRepo,
    PaymentsConfigurationRepo,
    QrCodesRepo
} = require('../../../libs/repo');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

const merchantRepo = new MerchantRepo(db);
const relationshipRepo = new RelationshipRepo(db);
const acquirerAccountConfigurationRepo = new AcquirerAccountConfigurationRepo(db);
const dnaMerchantMetadataRepo = new DnaMerchantMetadataRepo(db);
const paymentsConfigurationRepo = new PaymentsConfigurationRepo(db);
const qrCodesRepo = new QrCodesRepo(db);

export class BifrostService {
    async getMerchantDetails(merchantId) {
        return await merchantRepo.findOne({
            where: { id: merchantId },
            attributes: [
                'id',
                'name',
                'legalName',
                'description',
                'status',
                'label',
                'country',
                'isBankAccountVerified',
                'isAccountVerified',
                'stripeId',
                'stripeAccountType',
                'signupLinkFrom',
                'thirdPartyCustomer',
                'internalTransferStatus',
                'isClosureRequested',
                'host',
                'allowWithdrawals',
                'autoWithdraw',
                'merchantQrId',
                'created_at',
                'updated_at',
                'deleted_at'
            ]
        });
    }

    async getMerchantInfo(merchantQrId) {
        const merchant = await merchantRepo.findOne({
            where: { merchantQrId: merchantQrId },
            attributes: ['id', 'name', 'legalName', 'primaryOwnerId', 'isReceiptEnabled']
        });

        if (!merchant) return null;

        const relationship = await relationshipRepo.findOne({
            where: { merchantId: merchant.id }
        });

        if (!relationship) return null;

        const acquirerConfig = await acquirerAccountConfigurationRepo.findOne({
            where: { merchantId: merchant.id },
            attributes: ['adyenSubAccountId', 'dnaMid', 'gateway']
        });

        const infoCheck = merchant?.legalName ? true : false;

        if (!infoCheck) {
            return { status: 201, message: 'Required Information Missing for this merchant' };
        }

        let merchantDto = {
            id: merchant.id,
            business_name: merchant.legalName,
            customer_type: relationship.resellerId === 1 ? 'OMNIPAY' : 'DATMAN',
            isDna: acquirerConfig && acquirerConfig?.dnaMid ? true : false,
            gateway: acquirerConfig && acquirerConfig.gateway ? acquirerConfig.gateway : 'CARDSTREAM',
            isReceiptEnabled: merchant.isReceiptEnabled
        };

        return merchantDto;
    }

    async getDNAMetadata(merchantId) {
        const merchant = await merchantRepo.findOne({
            where: { id: merchantId },
            attributes: ['id']
        });
        if (!merchant) return { status: 201, message: 'Merchant does not exist!' };
        const dnaMerchantMetadata = await dnaMerchantMetadataRepo.findOne({
            where: { merchantId: merchantId },
            attributes: ['id', 'merchantId', 'terminalId', 'type']
        });
        if (!dnaMerchantMetadataRepo) return { status: 201, message: 'DNA terminal id missing!' };

        let dnaDto = {
            terminalId: dnaMerchantMetadata.terminalId,
            type: dnaMerchantMetadata.type
        };
        return dnaDto;
    }

    async getFirstDataMerchantId(merchantId) {
        return await paymentsConfigurationRepo.findOne({
            where: { mid: merchantId },
            attributes: ['id', 'merchantId', 'mid']
        });
    }

    async getMerchantInfoForQrV3(merchantQrId) {
        const qrInfo = await qrCodesRepo.findOne({ where: { qrUUID: merchantQrId } });

        if (!qrInfo) return null;

        const merchant = await merchantRepo.findOne({
            where: { id: qrInfo.merchantId },
            attributes: ['id', 'name', 'legalName', 'primaryOwnerId', 'isReceiptEnabled']
        });

        if (!merchant) return null;

        const relationship = await relationshipRepo.findOne({
            where: { merchantId: merchant.id }
        });

        if (!relationship) return null;

        const acquirerConfig = await acquirerAccountConfigurationRepo.findOne({
            where: { merchantId: merchant.id },
            attributes: ['adyenSubAccountId', 'dnaMid', 'gateway']
        });

        const infoCheck = merchant?.legalName ? true : false;

        if (!infoCheck) {
            return { status: 201, message: 'Required Information Missing for this merchant' };
        }

        let merchantDto = {
            id: merchant.id,
            business_name: merchant.legalName,
            customer_type: relationship.resellerId === 1 ? 'OMNIPAY' : 'DATMAN',
            isDna: acquirerConfig && acquirerConfig?.dnaMid ? true : false,
            gateway: acquirerConfig && acquirerConfig.gateway ? acquirerConfig.gateway : 'CARDSTREAM',
            isReceiptEnabled: merchant.isReceiptEnabled,
            amount: (qrInfo.amount / 100).toFixed(2),
            expiryDate: qrInfo.qrCodeExpiryDate,
            status: qrInfo.status
        };

        return merchantDto;
    }
}
