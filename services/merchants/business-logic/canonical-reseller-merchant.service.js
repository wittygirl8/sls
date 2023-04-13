var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');

const {
    MerchantRepo,
    OwnersDetailsRepo,
    AddressRepo,
    MerchantProductRequiredRepo,
    PaymentsConfigurationRepo,
    BusinessDetailRepo,
    MerchantBusinessDescriptionRepo
} = require('../../../libs/repo');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);
const merchantRepo = new MerchantRepo(db);
const ownersDetailsRepo = new OwnersDetailsRepo(db);
const addressRepo = new AddressRepo(db);
const merchantProductRequiredRepo = new MerchantProductRequiredRepo(db);
const paymentsConfigurationRepo = new PaymentsConfigurationRepo(db);
const businessDetailRepo = new BusinessDetailRepo(db);
const merchantBusinessDescriptionRepo = new MerchantBusinessDescriptionRepo(db);

export class CanonicalResellerMerchantService {
    async getCanonicalResellerMerchant(merchantId) {
        try {
            const merchant = await merchantRepo.findOne({
                where: {
                    id: merchantId
                }
            });

            let baseAddressId;
            let businessDetailId;
            let primaryOwnerId;
            let businessDetails;
            let ownersDetails;
            let address;

            if (!merchant) {
                return null;
            } else {
                baseAddressId = merchant.baseAddressId;
                businessDetailId = merchant.businessDetailId;
                primaryOwnerId = merchant.primaryOwnerId;
                businessDetails = await businessDetailRepo.findOne({ where: { id: businessDetailId } });
                ownersDetails = await ownersDetailsRepo.findOne({ where: { id: primaryOwnerId } });
                address = await addressRepo.findOne({ where: { id: baseAddressId } });
            }

            const paymentsConfiguration = await paymentsConfigurationRepo.findOne({
                where: { merchantId: merchant.id }
            });
            const merchantBusinessDescription = await merchantBusinessDescriptionRepo.findOne({
                where: { merchantId: merchant.id }
            });
            const merchantProductRequired = await merchantProductRequiredRepo.findAll({
                where: { merchantId: merchant.id }
            });

            let selectedAcquirer = [paymentsConfiguration.acquirerBank];

            const merchantProductRequiredList = [];
            merchantProductRequired.map((product) => {
                merchantProductRequiredList.push(product.productRequiredId);
            });

            const merchantDto = {
                businessDescription: merchantBusinessDescription
                    ? merchantBusinessDescription.businessDescriptionId
                    : '',
                canonicalResellerId: merchant.canonicalResellerId,
                country: merchant.country,
                externalContactName: ownersDetails.fullName,
                externalLegalName: merchant.legalName,
                externalMID: paymentsConfiguration.mid,
                externalMerchantEmail: ownersDetails.email,
                externalMerchantName: merchant.name,
                externalMerchantPhone: address.phoneNumber,
                externalMidAddressLine1: address.addressLine1,
                externalMidAddressLine2: address.addressLine2,
                externalMidCity: address.city,
                externalMidCounty: address.county,
                externalMidPostCode: address.postCode,
                merchantStatus: merchant.status,
                processorId: paymentsConfiguration.processorId,
                selectedAcquirer: selectedAcquirer,
                selectedMidType: merchantProductRequiredList,
                testMode: paymentsConfiguration.testMode,
                threeDSecure: paymentsConfiguration.threeDSecure,
                websiteUrl: businessDetails.websiteUrl
            };

            return merchantDto;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}
