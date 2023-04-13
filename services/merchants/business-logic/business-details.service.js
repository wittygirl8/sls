var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const {
    MerchantRepo,
    AddressRepo,
    OwnersDetailsRepo,
    BusinessDetailRepo,
    DocumentRepo
} = require('../../../libs/repo');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

const merchantRepo = new MerchantRepo(db);
const addressRepo = new AddressRepo(db);
const ownerDetailsRepo = new OwnersDetailsRepo(db);
const businessDetailRepo = new BusinessDetailRepo(db);
const documentRepo = new DocumentRepo(db);
const { DocumentStatusToName } = require('../helpers/document-status');
const { DocumentsCategoriesCountryWise } = require('../helpers/docType-map-businessType');

export class BusinessDetailsService {
    async getBusinessDetails(merchantId) {
        const merchant = await merchantRepo.findOne({
            where: {
                id: merchantId
            }
        });

        if (!merchant) return null;

        let merchantAddress = {};
        const isCanonicalResellerMerchant = ![1, 2].includes(merchant.canonicalResellerId);

        if (merchant.tradingAddressId) {
            merchantAddress = await addressRepo.findOne({
                where: {
                    id: merchant.tradingAddressId
                }
            });
        }

        if (isCanonicalResellerMerchant && merchant.baseAddressId) {
            merchantAddress = await addressRepo.findOne({
                where: {
                    id: merchant.baseAddressId
                }
            });
        }

        let merchantBusinessDetails;

        if (merchant.businessDetailId) {
            merchantBusinessDetails = await businessDetailRepo.findOne({
                where: {
                    id: merchant.businessDetailId
                }
            });
        }

        let owner = {};

        if (merchant.primaryOwnerId) {
            owner = await ownerDetailsRepo.findOne({
                where: {
                    id: merchant.primaryOwnerId
                }
            });
        }

        let ownerAddress = {};

        if (owner.ownerAddressId) {
            ownerAddress = await addressRepo.findOne({
                where: {
                    id: owner.ownerAddressId
                }
            });
        }

        return {
            businessDetails: {
                legalName: merchant.legalName,
                postCode: merchantAddress.postCode,
                addressLine1: merchantAddress.addressLine1,
                addressLine2: merchantAddress.addressLine2,
                city: merchantAddress.city,
                county: merchantAddress.county,
                telephoneNumber: merchantBusinessDetails?.phoneNumber
                    ? merchantBusinessDetails?.phoneNumber
                    : merchantAddress.phoneNumber,
                websiteUrl: merchantBusinessDetails?.websiteUrl,
                businessTypeId: merchantBusinessDetails?.businessTypeId
            },
            ownerDetails: {
                fullName: owner.fullName,
                postCode: ownerAddress.postCode,
                addressLine1: ownerAddress.addressLine1,
                addressLine2: ownerAddress.addressLine2,
                city: ownerAddress.city,
                county: ownerAddress.county,
                telephoneNumber: owner.contactPhone,
                email: owner.email
            }
        };
    }

    async updateBusinessDetails(merchantId, dto) {
        let transaction;

        try {
            const merchant = await merchantRepo.findOne({
                where: {
                    id: merchantId
                }
            });

            if (!merchant) return null;

            transaction = await db.sequelize.transaction();
            const isCanonicalResellerMerchant = ![1, 2].includes(merchant.canonicalResellerId);

            await merchantRepo.update(
                merchantId,
                {
                    legalName: dto.businessDetails.legalName
                },
                transaction
            );

            if (merchant.tradingAddressId) {
                await addressRepo.update(
                    merchant.tradingAddressId,
                    {
                        postCode: dto.businessDetails.postCode,
                        addressLine1: dto.businessDetails.addressLine1,
                        addressLine2: dto.businessDetails.addressLine2,
                        city: dto.businessDetails.city,
                        county: dto.businessDetails.county || ''
                    },
                    transaction
                );
            }

            if (isCanonicalResellerMerchant && merchant.baseAddressId) {
                await addressRepo.update(
                    merchant.baseAddressId,
                    {
                        postCode: dto.businessDetails.postCode,
                        addressLine1: dto.businessDetails.addressLine1,
                        addressLine2: dto.businessDetails.addressLine2,
                        city: dto.businessDetails.city,
                        county: dto.businessDetails.county || ''
                    },
                    transaction
                );
            }

            if (merchant.businessDetailId) {
                await businessDetailRepo.updateById(
                    merchant.businessDetailId,
                    {
                        phoneNumber: dto.businessDetails.telephoneNumber,
                        websiteUrl: dto.businessDetails.websiteUrl
                    },
                    transaction
                );
            }

            if (merchant.primaryOwnerId) {
                const owner = await ownerDetailsRepo.findOne({
                    where: {
                        id: merchant.primaryOwnerId
                    }
                });

                await ownerDetailsRepo.update(
                    merchant.primaryOwnerId,
                    {
                        fullName: dto.ownerDetails.fullName,
                        contactPhone: dto.ownerDetails.telephoneNumber,
                        email: dto.ownerDetails.email
                    },
                    transaction
                );

                if (owner.ownerAddressId) {
                    await addressRepo.update(owner.ownerAddressId, dto.ownerDetails, transaction);
                }
            }

            await transaction.commit();
        } catch (error) {
            console.log(error);
            if (transaction) {
                await transaction.rollback();
            }
            throw error;
        }
    }

    async getMerchantBusinessTypeAndBankStatus(merchantId) {
        const merchant = await merchantRepo.findOne({
            where: {
                id: merchantId
            },
            include: [
                {
                    model: db.BusinessDetail,
                    include: [
                        {
                            model: db.BusinessType
                        }
                    ]
                }
            ]
        });

        const businessTypeId =
            merchant.BusinessDetail && merchant.BusinessDetail.BusinessType
                ? merchant.BusinessDetail.BusinessType.id
                : null;
        const businessTypeName =
            merchant.BusinessDetail && merchant.BusinessDetail.BusinessType
                ? merchant.BusinessDetail.BusinessType.name
                : null;

        const allDocuments = await documentRepo.findAll({
            where: {
                merchantId: merchantId
            },
            attributes: ['id', 'documentTypeId', 'size', 'merchantId', 'status']
        });

        const requiredDocOfEachType = DocumentsCategoriesCountryWise[merchant.country];
        const requiredDocForSpecificType = requiredDocOfEachType[businessTypeId];

        let bankDocStatus = DocumentStatusToName.MISSING;
        let addressDocStatus = DocumentStatusToName.MISSING;
        let idDocStatus = DocumentStatusToName.MISSING;
        let rejectedDoc = [];

        allDocuments.forEach((doc) => {
            if (
                requiredDocForSpecificType?.bankDocType?.includes(doc.documentTypeId) &&
                bankDocStatus === DocumentStatusToName.MISSING
            ) {
                bankDocStatus = doc.status;
                if (doc.status === DocumentStatusToName.REJECTED) {
                    rejectedDoc.push(doc.documentTypeId);
                }
            }
            if (
                requiredDocForSpecificType?.addressDocType?.includes(doc.documentTypeId) &&
                addressDocStatus === DocumentStatusToName.MISSING
            ) {
                addressDocStatus = doc.status;
                if (doc.status === DocumentStatusToName.REJECTED) {
                    rejectedDoc.push(doc.documentTypeId);
                }
            }
            if (
                requiredDocForSpecificType?.idDocType?.includes(doc.documentTypeId) &&
                idDocStatus === DocumentStatusToName.MISSING
            ) {
                idDocStatus = doc.status;
                if (doc.status === DocumentStatusToName.REJECTED) {
                    rejectedDoc.push(doc.documentTypeId);
                }
            }
        });

        const businessTypeDTO = {
            typeId: businessTypeId,
            typeName: businessTypeName,
            isBankAccountVerified: merchant.isBankAccountVerified,
            isAccountVerified: merchant.isAccountVerified,
            allowWithdrawals: merchant.allowWithdrawals,
            accountStatus: merchant.accountStatus,
            bankDocStatus: bankDocStatus,
            addressDocStatus: addressDocStatus,
            idDocStatus: idDocStatus,
            rejectedDoc: rejectedDoc
        };

        return businessTypeDTO;
    }
}
