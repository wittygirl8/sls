import Axios from 'axios';
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
var { MerchantRepo } = require('../../../libs/repo/merchant.repo');
var { BusinessDetailRepo } = require('../../../libs/repo/business-detail.repo');
var { AddressRepo } = require('../../../libs/repo/address.repo');
var { OwnersDetailsRepo } = require('../../../libs/repo/ownerdetails.repo');
var { MerchantProductRequiredRepo } = require('../../../libs/repo/merchant-product-required.repo');
var { BusinessProfileRepo } = require('../../../libs/repo/business-profile.repo');
var { TransactionProfileRepo } = require('../../../libs/repo/transaction-profile.repo');
var { MerchantBusinessDescriptionRepo } = require('../../../libs/repo/merchant-business-description.repo');
var { BusinessBankDetailsRepo } = require('../../../libs/repo/business-bank-details.repo');
var { AdyenMerchantMetadataRepo } = require('../../../libs/repo/adyen-merchant-metadata-repo');
var { AcquirerAccountConfigurationRepo } = require('../../../libs/repo/acquirer-account-configuration-repo');
const { CountryISOCodeFromName, CountyCurrencyFromName } = require('../helpers/county-to-country-code');
var { models, auditLogsPublisher } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
const { AdyenAccountStatus } = require('../helpers/adyen-status');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);
const { Op } = db.Sequelize;

const merchantRepo = new MerchantRepo(db);
const businessDetailRepo = new BusinessDetailRepo(db);
const addressRepo = new AddressRepo(db);
const ownersDetailsRepo = new OwnersDetailsRepo(db);
const merchantProductRequiredRepo = new MerchantProductRequiredRepo(db);
const merchantBusinessDescriptionRepo = new MerchantBusinessDescriptionRepo(db);
const businessProfileRepo = new BusinessProfileRepo(db);
const transactionProfileRepo = new TransactionProfileRepo(db);
const businessBankDetailsRepo = new BusinessBankDetailsRepo(db);
const adyenMerchantMetadataRepo = new AdyenMerchantMetadataRepo(db);
const acquirerAccountConfigurationRepo = new AcquirerAccountConfigurationRepo(db);
const { UserType } = models;

const { MerchantStatus } = require('../helpers/MerchantStatus');

const ADYEN_API_KEY = process.env.ADYEN_API_KEY;
const ADYEN_API_URL = process.env.ADYEN_API_URL;

export class OnboardingService {
    async UpdateNameAndAddress(merchantId, data, event, userId) {
        let transaction;
        let auditLogData = [];
        try {
            const merchant = await merchantRepo.findOne({
                where: {
                    id: merchantId
                }
            });

            if (!merchant) {
                return null;
            }

            const onboardingStep =
                merchant.status === MerchantStatus.MERCHANT_PENDING ? 1 : Math.max(2, merchant.onboardingStep);

            let addressId = merchant.baseAddressId;
            let businessDetailId = merchant.businessDetailId;
            const existingAddress = await addressRepo.findOne({ where: { id: addressId } });

            const addressDto = {
                state: data.state,
                city: data.city,
                country: data.country,
                postCode: data.postCode,
                addressLine1: data.addressLine1,
                addressLine2: data.addressLine2
            };

            const existingBusinessDetails = await businessDetailRepo.findOne({
                where: { id: businessDetailId }
            });

            const businessDetailDto = {
                registeredNumber: data.registeredNumber,
                creationDate: data.creationDate,
                businessTypeId: data.businessTypeId
            };

            transaction = await db.sequelize.transaction();

            if (!merchant.baseAddressId) {
                addressId = (await addressRepo.save(addressDto, transaction)).id;
            } else {
                const updatedAddress = await addressRepo.update(addressId, addressDto, transaction);
                const addressUpdateDto = {
                    beforeUpdate: existingAddress,
                    afterUpdate: updatedAddress,
                    tableName: 'addresses'
                };
                auditLogData.push(addressUpdateDto);
            }

            if (!merchant.businessDetailId) {
                businessDetailId = (await businessDetailRepo.save(businessDetailDto, transaction)).id;
            } else {
                const updatedBusinessDetails = await businessDetailRepo.updateById(
                    businessDetailId,
                    businessDetailDto,
                    transaction
                );
                const businessUpdateDto = {
                    beforeUpdate: existingBusinessDetails,
                    afterUpdate: updatedBusinessDetails,
                    tableName: 'business_details'
                };
                auditLogData.push(businessUpdateDto);
            }

            const updatedMerchant = await merchantRepo.update(
                merchant.id,
                {
                    legalName: data.legalName,
                    onboardingStep: onboardingStep,
                    baseAddressId: addressId,
                    businessDetailId: businessDetailId
                },
                transaction
            );
            const merchantUpdateDto = {
                beforeUpdate: merchant,
                afterUpdate: updatedMerchant,
                tableName: 'merchants'
            };
            auditLogData.push(merchantUpdateDto);

            const adyenMerchant = await acquirerAccountConfigurationRepo.findOne({ where: { merchantId: merchantId } });

            if (
                adyenMerchant &&
                (data.userType === UserType.ADMIN || data.userType === UserType.SUPER_ADMIN) &&
                adyenMerchant?.accountStatus !== AdyenAccountStatus.SUSPENDED &&
                adyenMerchant?.accountStatus !== AdyenAccountStatus.CLOSED
            ) {
                const businessDetailsDto = {
                    legalBusinessName: data.legalName,
                    doingBusinessAs: data.legalName,
                    registrationNumber: data.registeredNumber
                };

                const businessAddressDto = {
                    city: data.city?.trim() ? data.city?.trim() : '-',
                    country: CountryISOCodeFromName[merchant.country],
                    postalCode: data.postCode,
                    stateOrProvince: CountryISOCodeFromName[merchant.country],
                    houseNumberOrName: data.addressLine1,
                    street: data.addressLine2 ? data.addressLine2 : '-'
                };

                const accountHolderDetails = {
                    address: { ...businessAddressDto },
                    businessDetails: {
                        ...businessDetailsDto
                    }
                };

                await updateAdyenData(accountHolderDetails, merchantId);
            }
            await auditLog(auditLogData, event, userId, merchantId);

            await transaction.commit();

            return merchant;
        } catch (error) {
            console.log(error);
            if (transaction) {
                await transaction.rollback();
            }
            throw error;
        }
    }

    async GetNameAndAddress(merchantId) {
        const merchant = await merchantRepo.findOne({
            where: {
                id: { [Op.eq]: merchantId }
            }
        });

        if (!merchant) {
            return null;
        }

        const businessDetail = await businessDetailRepo.findOne({
            where: {
                id: merchant.businessDetailId
            }
        });

        if (!businessDetail) {
            if (!merchant.legalName) {
                return null;
            }
            return {
                legalName: merchant.legalName
            };
        }

        const address = await addressRepo.findOne({
            where: {
                id: merchant.baseAddressId
            }
        });

        if (!address) {
            if (!merchant.legalName) {
                return null;
            }
            return {
                legalName: merchant.legalName
            };
        }

        return {
            registeredNumber: businessDetail.registeredNumber,
            legalName: merchant.legalName,
            postCode: address.postCode,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2,
            state: address.state,
            city: address.city,
            country: address.country
        };
    }

    async UpdateBusinessDetail(merchantId, data, event, userId) {
        let transaction;
        let auditLogData = [];
        try {
            transaction = await db.sequelize.transaction();

            const merchant = await merchantRepo.findOne({
                where: {
                    id: merchantId
                }
            });

            if (!merchant) {
                return null;
            }

            const onboardingStep =
                merchant.status === MerchantStatus.MERCHANT_PENDING ? 1 : Math.max(3, merchant.onboardingStep);
            let businessDetailId = merchant.businessDetailId;

            const businessDetailDto = {
                businessTypeId: data.businessTypeId,
                vatNumber: data.vatNumber,
                tradingName: data.tradingName,
                phoneNumber: data.phoneNumber,
                websiteUrl: data.websiteUrl,
                employeeIdNumber: data.employeeIdNumber,
                email: data.email,
                isRegisteredBusiness: data.isRegisteredBusiness,
                isAccountNameSame: data.isAccountNameSame
            };

            if (!merchant.businessDetailId) {
                businessDetailId = (await businessDetailRepo.save(businessDetailDto, transaction)).id;
            } else {
                const businessDetail = await businessDetailRepo.findOne({
                    where: {
                        id: businessDetailId
                    }
                });
                const existingBusinessDetails = { ...JSON.parse(JSON.stringify(businessDetail)) };
                const updatedBusinessDetails = await businessDetailRepo.update(
                    businessDetail,
                    businessDetailDto,
                    transaction
                );
                const businessUpdateDto = {
                    beforeUpdate: existingBusinessDetails,
                    afterUpdate: { ...JSON.parse(JSON.stringify(updatedBusinessDetails)) },
                    tableName: 'business_details'
                };
                auditLogData.push(businessUpdateDto);
            }

            const updatedMerchant = await merchantRepo.update(
                merchant.id,
                {
                    onboardingStep: onboardingStep,
                    businessDetailId: businessDetailId
                },
                transaction
            );
            const merchantUpdateDto = {
                beforeUpdate: merchant,
                afterUpdate: updatedMerchant,
                tableName: 'merchants'
            };
            auditLogData.push(merchantUpdateDto);
            const adyenMerchant = await acquirerAccountConfigurationRepo.findOne({
                where: { merchantId: merchantId }
            });

            if (
                adyenMerchant &&
                (data.userType === UserType.ADMIN || data.userType === UserType.SUPER_ADMIN) &&
                adyenMerchant?.accountStatus !== AdyenAccountStatus.SUSPENDED &&
                adyenMerchant?.accountStatus !== AdyenAccountStatus.CLOSED
            ) {
                const accountHolderDetails = {
                    fullPhoneNumber: data?.phoneNumber?.startsWith('+') ? data.phoneNumber : `+${data.phoneNumber}`,
                    email: data.email
                };
                await updateAdyenData(accountHolderDetails, merchantId);
            }
            await auditLog(auditLogData, event, userId, merchantId);
            await transaction.commit();

            return merchant;
        } catch (error) {
            console.log(error);
            if (transaction) {
                await transaction.rollback();
            }
            throw error;
        }
    }

    async GetBusinessDetail(merchantId) {
        const merchant = await merchantRepo.findOne({
            where: {
                id: { [Op.eq]: merchantId }
            }
        });

        if (!merchant) {
            return null;
        }

        const businessDetail = await businessDetailRepo.findOne({
            where: {
                id: merchant.businessDetailId
            }
        });

        if (!businessDetail) {
            return {
                employeeIdNumber: ''
            };
        }

        return {
            businessTypeId: businessDetail.businessTypeId,
            vatNumber: businessDetail.vatNumber,
            tradingName: businessDetail.tradingName,
            phoneNumber: businessDetail.phoneNumber,
            employeeIdNumber: businessDetail.employeeIdNumber ? businessDetail.employeeIdNumber : '',
            websiteUrl: businessDetail.websiteUrl,
            email: businessDetail.email ? businessDetail.email : '',
            isRegisteredBusiness: businessDetail.isRegisteredBusiness,
            isAccountNameSame: businessDetail.isAccountNameSame
        };
    }

    async UpdateTradingAddress(merchantId, data, event, userId) {
        let transaction;
        let auditLogData = [];
        try {
            transaction = await db.sequelize.transaction();

            const merchant = await merchantRepo.findOne({
                where: {
                    id: merchantId
                }
            });

            if (!merchant) {
                return null;
            }

            if (merchant.status === MerchantStatus.WATCHLIST) {
                return { message: 'Bank Update is not available at this time' };
            }

            const onboardingStep = data.step
                ? data.step
                : merchant.status === MerchantStatus.MERCHANT_PENDING
                ? 1
                : Math.max(4, merchant.onboardingStep);

            let addressId = merchant.tradingAddressId;
            const existingAddressDto = await addressRepo.findOne({ where: { id: addressId } });
            const addressDto = {
                state: data.state,
                city: data.city,
                country: data.country,
                postCode: data.postCode,
                addressLine1: data.addressLine1,
                addressLine2: data.addressLine2
            };

            if (!merchant.tradingAddressId) {
                addressId = (await addressRepo.save(addressDto, transaction)).id;
            } else {
                const updatedAddressDto = await addressRepo.update(addressId, addressDto, transaction);
                const addressUpdateDto = {
                    beforeUpdate: existingAddressDto,
                    afterUpdate: updatedAddressDto,
                    tableName: 'addresses'
                };
                auditLogData.push(addressUpdateDto);
            }

            let businessBankDetailsId = merchant.businessBankDetailsId;
            const existingBankDto = await businessBankDetailsRepo.findOne({
                where: {
                    id: businessBankDetailsId
                }
            });
            const bankAccountDto = {
                sortCode: data.sortCode ? data.sortCode : null,
                newAccountNumber: data.newAccountNumber,
                accountHolderName: data.accountHolderName,
                nameOfBank: data.nameOfBank,
                bankAddress1: data.bankAddress1,
                bankAddress2: data.bankAddress2,
                bsb: data.bsb,
                routingNumber: data.routingNumber,
                transitNumber: data.transitNumber,
                financialInstitutionNumber: data.financialInstitutionNumber
            };

            if (data.tradingName) {
                const businessDetailId = merchant.businessDetailId;
                const businessDetailDto = {
                    tradingName: data.tradingName
                };
                await businessDetailRepo.updateById(businessDetailId, businessDetailDto, transaction);
            }

            let bankDetails;

            if (businessBankDetailsId) {
                bankDetails = await businessBankDetailsRepo.findOne({
                    where: {
                        id: businessBankDetailsId
                    },
                    attributes: ['adyenBankUUID']
                });
            }

            if (!businessBankDetailsId) {
                businessBankDetailsId = (await businessBankDetailsRepo.save(bankAccountDto, transaction)).id;
            } else {
                const updatedBankDto = await businessBankDetailsRepo.update(
                    businessBankDetailsId,
                    bankAccountDto,
                    transaction
                );
                const bankUpdateDto = {
                    beforeUpdate: existingBankDto,
                    afterUpdate: updatedBankDto,
                    tableName: 'business_bank_details'
                };
                auditLogData.push(bankUpdateDto);
            }

            const updatedMerchant = await merchantRepo.update(
                merchant.id,
                {
                    onboardingStep: onboardingStep,
                    tradingAddressId: addressId,
                    businessBankDetailsId: businessBankDetailsId
                },
                transaction
            );
            const merchantUpdateDto = {
                beforeUpdate: merchant,
                afterUpdate: updatedMerchant,
                tableName: 'merchants'
            };
            auditLogData.push(merchantUpdateDto);
            const adyenAccount = await acquirerAccountConfigurationRepo.findOne({
                where: { merchantId: merchantId }
            });

            if (
                adyenAccount &&
                bankDetails?.adyenBankUUID &&
                data.step === 3 &&
                (data.userType === UserType.ADMIN || data.userType === UserType.SUPER_ADMIN) &&
                adyenAccount?.accountStatus !== AdyenAccountStatus.SUSPENDED &&
                adyenAccount?.accountStatus !== AdyenAccountStatus.CLOSED
            ) {
                const bankDto = {
                    branchCode: data.sortCode,
                    accountNumber: data.newAccountNumber,
                    countryCode: CountryISOCodeFromName[merchant.country],
                    currencyCode: CountyCurrencyFromName[merchant.country],
                    bankName: data.nameOfBank,
                    ownerName: data.accountHolderName,
                    ownerCity: data?.ownerDetails.city?.trim() ? data?.ownerDetails.city?.trim() : '-',
                    ownerCountryCode: CountryISOCodeFromName[merchant.country],
                    ownerHouseNumberOrName: data?.ownerDetails.addressLine1,
                    ownerPostalCode: data?.ownerDetails.postCode,
                    ownerStreet: data?.ownerDetails.addressLine2 ? data?.ownerDetails.addressLine2 : '-',
                    bankAccountUUID: bankDetails?.adyenBankUUID
                };

                const accountHolderDetails = {
                    bankAccountDetails: [bankDto]
                };

                await updateAdyenData(accountHolderDetails, merchantId);
            }
            await auditLog(auditLogData, event, userId, merchantId);
            await transaction.commit();

            return merchant;
        } catch (error) {
            console.log(error);
            if (transaction) {
                await transaction.rollback();
            }
            throw error;
        }
    }

    async GetTradingAndAddress(merchantId) {
        const merchant = await merchantRepo.findOne({
            where: {
                id: { [Op.eq]: merchantId }
            }
        });

        if (!merchant) {
            return null;
        }

        const businessBankDetails = await businessBankDetailsRepo.findOne({
            where: {
                id: merchant.businessBankDetailsId
            }
        });

        const address = await addressRepo.findOne({
            where: {
                id: merchant.tradingAddressId
            }
        });

        if (!address && !businessBankDetails) {
            return null;
        }

        return {
            postCode: address ? address.postCode : '',
            addressLine1: address ? address.addressLine1 : '',
            addressLine2: address ? address.addressLine2 : '',
            state: address ? address.state : '',
            city: address ? address.city : '',
            country: address ? address.country : '',
            sortCode: businessBankDetails ? businessBankDetails.sortCode : '',
            newAccountNumber: businessBankDetails ? businessBankDetails.newAccountNumber : '',
            accountHolderName: businessBankDetails ? businessBankDetails.accountHolderName : '',
            status: businessBankDetails ? businessBankDetails.status : '',
            nameOfBank: businessBankDetails ? businessBankDetails.nameOfBank : '',
            bankAddress1: businessBankDetails ? businessBankDetails.bankAddress1 : '',
            bankAddress2: businessBankDetails ? businessBankDetails.bankAddress2 : '',
            bsb: businessBankDetails ? businessBankDetails.bsb : '',
            routingNumber: businessBankDetails ? businessBankDetails.routingNumber : '',
            transitNumber: businessBankDetails ? businessBankDetails.transitNumber : '',
            financialInstitutionNumber: businessBankDetails ? businessBankDetails.financialInstitutionNumber : ''
        };
    }

    async UpdateOwnerDetails(merchantId, data, event, userId) {
        let transaction;
        let auditLogData = [];
        try {
            transaction = await db.sequelize.transaction();

            const merchant = await merchantRepo.findOne({
                where: {
                    id: merchantId
                }
            });

            if (!merchant) {
                return null;
            }

            let primaryOwnerId = merchant.primaryOwnerId;
            const existingOwnerDto = await ownersDetailsRepo.findOne({ where: { id: primaryOwnerId } });

            const primaryOwnerDto = {
                title: data.ownersDetails.title,
                fullName: data.ownersDetails.fullName,
                nationality: data.ownersDetails.nationality,
                personalId: data.ownersDetails.personalId,
                birthDate: data.ownersDetails.dateOfBirth,
                email: data.ownersDetails.email,
                contactPhone: data.ownersDetails.contactTel,
                businessTitle: data.ownersDetails.businessTitle,
                ownership: data.ownersDetails.ownership,
                ownershipType: data.ownersDetails.ownershipType,
                ssnLastDigits: data.ownersDetails.ssnLastDigits
            };

            if (!primaryOwnerId) {
                primaryOwnerId = (await ownersDetailsRepo.save(primaryOwnerDto, transaction)).id;
            } else {
                const updatedOwnerDto = await ownersDetailsRepo.update(primaryOwnerId, primaryOwnerDto, transaction);
                const ownerUpdateDto = {
                    beforeUpdate: existingOwnerDto,
                    afterUpdate: updatedOwnerDto,
                    tableName: 'owners_details'
                };
                auditLogData.push(ownerUpdateDto);
            }

            const updatedMerchant = await merchantRepo.update(
                merchant.id,
                {
                    primaryOwnerId: primaryOwnerId
                },
                transaction
            );
            const merchantUpdateDto = {
                beforeUpdate: merchant,
                afterUpdate: updatedMerchant,
                tableName: 'merchants'
            };
            auditLogData.push(merchantUpdateDto);
            await auditLog(auditLogData, event, userId, merchantId);

            await transaction.commit();

            return merchant;
        } catch (error) {
            console.log(error);
            if (transaction) {
                await transaction.rollback();
            }
            throw error;
        }
    }

    async UpdateOwnerAddress(merchantId, data, event, userId) {
        let transaction;
        let auditLogData = [];
        try {
            transaction = await db.sequelize.transaction();

            const merchant = await merchantRepo.findOne({
                where: {
                    id: merchantId
                }
            });

            if (!merchant) {
                return null;
            }

            const onboardingStep =
                merchant.status === MerchantStatus.MERCHANT_PENDING ? 1 : Math.max(5, merchant.onboardingStep);

            const ownersDetails = await ownersDetailsRepo.findOne({
                where: {
                    id: merchant.primaryOwnerId
                }
            });

            const existingOwnerAddressDto = await addressRepo.findOne({ where: { id: ownersDetails.ownerAddressId } });

            const ownerAddressDto = {
                phoneNumber: data.addressData.phoneNumber,
                state: data.addressData.state,
                city: data.addressData.city,
                country: data.addressData.country,
                postCode: data.addressData.postCode,
                addressLine1: data.addressData.addressLine1,
                addressLine2: data.addressData.addressLine2
            };

            let ownerUpdateDetails;
            if (!ownersDetails.ownerAddressId) {
                const primaryOwnerAddressId = (await addressRepo.save(ownerAddressDto, transaction)).id;
                const primaryOwnerDto = {
                    ownerAddressId: primaryOwnerAddressId
                };

                ownerUpdateDetails = await ownersDetailsRepo.update(
                    merchant.primaryOwnerId,
                    primaryOwnerDto,
                    transaction
                );
                const ownerUpdateDto = {
                    beforeUpdate: ownersDetails,
                    afterUpdate: ownerUpdateDetails,
                    tableName: 'owners_details'
                };
                auditLogData.push(ownerUpdateDto);
            } else {
                const updatedOwnerAdress = await addressRepo.update(
                    ownersDetails.ownerAddressId,
                    ownerAddressDto,
                    transaction
                );
                const ownerAddressUpdateDto = {
                    beforeUpdate: existingOwnerAddressDto,
                    afterUpdate: updatedOwnerAdress,
                    tableName: 'addresses'
                };
                auditLogData.push(ownerAddressUpdateDto);
            }

            if (data.firstName && data.lastName) {
                const primaryOwnerData = {
                    fullName: `${data.firstName} ${data.lastName}`
                };
                const updatedOwnerDetails = await ownersDetailsRepo.update(
                    merchant.primaryOwnerId,
                    primaryOwnerData,
                    transaction
                );
                const ownerUpdateDto = {
                    beforeUpdate: ownersDetails,
                    afterUpdate: updatedOwnerDetails,
                    tableName: 'owners_details'
                };
                auditLogData.push(ownerUpdateDto);
            }

            const updatedMerchant = await merchantRepo.update(
                merchant.id,
                {
                    onboardingStep: onboardingStep
                },
                transaction
            );
            const merchantUpdateDto = {
                beforeUpdate: merchant,
                afterUpdate: updatedMerchant,
                tableName: 'merchants'
            };
            auditLogData.push(merchantUpdateDto);
            const adyenAccount = await acquirerAccountConfigurationRepo.findOne({ where: { merchantId: merchantId } });

            if (
                adyenAccount &&
                (data.userType === UserType.ADMIN || data.userType === UserType.SUPER_ADMIN) &&
                adyenAccount?.accountStatus !== AdyenAccountStatus.SUSPENDED &&
                adyenAccount?.accountStatus !== AdyenAccountStatus.CLOSED
            ) {
                const businessTypeId = data?.businessTypeId;

                const ownerAddressData = {
                    city: data.addressData.city?.trim() ? data.addressData.city?.trim() : '-',
                    country: CountryISOCodeFromName[merchant.country],
                    postalCode: data.addressData.postCode,
                    stateOrProvince: CountryISOCodeFromName[merchant.country],
                    houseNumberOrName: data.addressData.addressLine1,
                    street: data.addressData.addressLine2 ? data.addressData.addressLine2 : '-'
                };

                const phoneNumberData = {
                    phoneNumber: ownersDetails?.contactPhone,
                    phoneCountryCode: CountryISOCodeFromName[merchant.country]
                };

                let accountHolderDetails;
                let shareholderCode;
                let signatoryCode;
                let adyenMerchant;

                if (businessTypeId === 2) {
                    accountHolderDetails = {
                        address: { ...ownerAddressData },
                        individualDetails: {
                            personalData: {
                                dateOfBirth: ownersDetails?.birthDate,
                                nationality: CountryISOCodeFromName[merchant.country]
                            },
                            name: {
                                firstName: data.firstName,
                                lastName: data.lastName
                            }
                        },
                        email: ownersDetails?.email,
                        phoneNumber: { ...phoneNumberData }
                    };
                    await updateAdyenData(accountHolderDetails, merchantId);
                } else {
                    adyenMerchant = await adyenMerchantMetadataRepo.findOne({
                        where: { merchantId: merchantId }
                    });

                    const adyenMetadata = adyenMerchant?.metaData && JSON.parse(adyenMerchant?.metaData);
                    shareholderCode = adyenMetadata?.shareholderCode;
                    signatoryCode = adyenMetadata?.signatoryCode;

                    const ownerDetailsDto = {
                        name: {
                            firstName: data.firstName,
                            lastName: data.lastName
                        },
                        address: { ...ownerAddressData },
                        email: ownersDetails?.email,
                        personalData: {
                            dateOfBirth: ownersDetails?.birthDate,
                            nationality: CountryISOCodeFromName[merchant.country]
                        }
                    };

                    const shareHolder = [
                        {
                            ...ownerDetailsDto,
                            shareholderCode: shareholderCode,
                            shareholderType: 'Owner'
                        }
                    ];

                    const signatories = [
                        {
                            ...ownerDetailsDto,
                            jobTitle: 'President',
                            signatoryCode: signatoryCode
                        }
                    ];

                    accountHolderDetails = {
                        businessDetails: {
                            shareholders: shareHolder,
                            signatories: signatories
                        }
                    };
                    const response = await updateAdyenData(accountHolderDetails, merchantId);

                    if (!signatoryCode || !shareholderCode) {
                        const dto = {
                            shareholderCode:
                                response?.accountHolderDetails?.businessDetails?.shareholders[0]?.shareholderCode,
                            signatoryCode:
                                response?.accountHolderDetails?.businessDetails?.signatories[0]?.signatoryCode
                        };

                        let adyenMetaDataDto = {
                            metaData: JSON.stringify({ dto })
                        };

                        if (adyenMerchant) {
                            await adyenMerchantMetadataRepo.update(adyenMerchant.id, adyenMetaDataDto, transaction);
                        } else {
                            adyenMetaDataDto = {
                                merchantId: merchantId,
                                metaData: JSON.stringify(dto)
                            };
                            await adyenMerchantMetadataRepo.save(adyenMetaDataDto, transaction);
                        }
                    }
                }
            }
            await auditLog(auditLogData, event, userId, merchantId);
            await transaction.commit();

            return merchant;
        } catch (error) {
            console.log(error);
            if (transaction) {
                await transaction.rollback();
            }
            throw error;
        }
    }

    async GetOwnerDetailsAndAddress(merchantId) {
        const merchant = await merchantRepo.findOne({
            where: {
                id: { [Op.eq]: merchantId }
            }
        });

        if (!merchant) {
            return null;
        }

        const ownersDetails = await ownersDetailsRepo.findOne({
            where: {
                id: merchant.primaryOwnerId
            }
        });

        if (!ownersDetails) {
            return {
                ssnLastDigits: ''
            };
        }

        const ownersDetailsAddress = await addressRepo.findOne({
            where: {
                id: ownersDetails.ownerAddressId
            }
        });

        var addressData = null;
        if (ownersDetailsAddress) {
            addressData = {
                postCode: ownersDetailsAddress.postCode,
                addressLine1: ownersDetailsAddress.addressLine1,
                addressLine2: ownersDetailsAddress.addressLine2,
                city: ownersDetailsAddress.city,
                country: ownersDetailsAddress.country,
                state: ownersDetailsAddress.state
            };
        }

        return {
            ownersDetails: {
                title: ownersDetails.title,
                fullName: ownersDetails.fullName,
                personalId: ownersDetails.personalId,
                nationality: ownersDetails.nationality,
                dateOfBirth: ownersDetails.birthDate,
                email: ownersDetails.email,
                contactTel: ownersDetails.contactPhone,
                businessTitle: ownersDetails.businessTitle,
                ownership: ownersDetails.ownership,
                ownershipType: ownersDetails.ownershipType,
                ssnLastDigits: ownersDetails.ssnLastDigits
            },
            addressData: addressData
        };
    }

    async UpdateBusinessProfile(merchantId, data, event, userId) {
        let transaction;
        let auditLogData = [];
        try {
            transaction = await db.sequelize.transaction();

            const merchant = await merchantRepo.findOne({
                where: {
                    id: merchantId
                }
            });

            if (!merchant) {
                return null;
            }

            const onboardingStep =
                merchant.status === MerchantStatus.MERCHANT_PENDING ? 1 : Math.max(6, merchant.onboardingStep);

            const businessProfileDto = {
                merchantId: merchantId,
                startedBusinessAt: data.startedBusinessAt,
                isBusinessMakingProducts: data.isBusinessMakingProducts,
                productDescription: data.productDescription,
                stockLocation: data.stockLocation,
                isStockSufficient: data.isStockSufficient
            };

            const businessProfile = await businessProfileRepo.findOne({
                where: {
                    merchantId: merchantId
                }
            });

            if (!businessProfile) {
                await businessProfileRepo.save(businessProfileDto, transaction);
            } else {
                const UpdatedBusinessProfile = await businessProfileRepo.update(
                    businessProfile,
                    businessProfileDto,
                    transaction
                );
                const businessProfileUpdateDto = {
                    beforeUpdate: businessProfile,
                    afterUpdate: UpdatedBusinessProfile,
                    tableName: 'business_profile'
                };
                auditLogData.push(businessProfileUpdateDto);
            }

            await updateRelationshipItems({
                merchantId: merchantId,
                itemsIds: data.businessDescriptions,
                repository: merchantBusinessDescriptionRepo,
                propertyName: 'businessDescriptionId',
                transaction: transaction
            });

            const updatedMerchant = await merchantRepo.update(
                merchant.id,
                {
                    onboardingStep: onboardingStep
                },
                transaction
            );
            const merchantUpdateDto = {
                beforeUpdate: merchant,
                afterUpdate: updatedMerchant,
                tableName: 'merchants'
            };
            auditLogData.push(merchantUpdateDto);
            await auditLog(auditLogData, event, userId, merchantId);
            await transaction.commit();

            return merchant;
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            throw error;
        }
    }

    async GetBusinessProfile(merchantId) {
        const businessProfile = await businessProfileRepo.findOne({
            where: {
                merchantId: merchantId
            }
        });

        if (!businessProfile) {
            return null;
        }

        const merchantBusinessDescriptionsIds = (
            await merchantBusinessDescriptionRepo.findAll({
                where: {
                    merchantId: merchantId
                }
            })
        ).map((m) => m.businessDescriptionId);

        const businessProfileData = {
            id: businessProfile.id,
            merchantId: businessProfile.merchantId,
            startedBusinessAt: businessProfile.startedBusinessAt,
            isBusinessMakingProducts: businessProfile.isBusinessMakingProducts,
            stockLocation: businessProfile.stockLocation,
            isStockSufficient: businessProfile.isStockSufficient,
            productDescription: businessProfile.productDescription,
            businessDescriptions: merchantBusinessDescriptionsIds
        };

        return businessProfileData;
    }

    async UpdateTransactionProfile(merchantId, data, event, userId) {
        let transaction;

        try {
            const transactionProfileDto = data.transactionProfileData;
            transaction = await db.sequelize.transaction();
            let auditLogData = [];
            const merchant = await merchantRepo.findOne({
                where: {
                    id: merchantId
                }
            });

            if (!merchant) {
                return null;
            }

            const onboardingStep =
                merchant.status === MerchantStatus.MERCHANT_PENDING ? 1 : Math.max(7, merchant.onboardingStep);

            const updatedMerchant = await merchantRepo.update(
                merchant.id,
                {
                    onboardingStep: onboardingStep
                },
                transaction
            );
            const merchantUpdateDto = {
                beforeUpdate: merchant,
                afterUpdate: updatedMerchant,
                tableName: 'merchants'
            };
            auditLogData.push(merchantUpdateDto);

            const transactionProfile = await transactionProfileRepo.findOne({
                where: {
                    merchantId: merchantId
                }
            });

            let updatedTransactionProfile;
            if (transactionProfile) {
                updatedTransactionProfile = await transactionProfileRepo.update(
                    transactionProfile.id,
                    transactionProfileDto,
                    transaction
                );
            } else {
                transactionProfileDto.merchantId = merchantId;
                updatedTransactionProfile = await transactionProfileRepo.save(transactionProfileDto, transaction);
            }
            const transactionUpdateDto = {
                beforeUpdate: transactionProfile,
                afterUpdate: updatedTransactionProfile,
                tableName: 'transactions'
            };
            auditLogData.push(transactionUpdateDto);
            await auditLog(auditLogData, event, userId, merchantId);
            await transaction.commit();

            return updatedTransactionProfile;
        } catch (error) {
            console.log(error);
            if (transaction) {
                await transaction.rollback();
            }
            throw error;
        }
    }

    async GetTransactionProfile(merchantId) {
        const transactionProfile = await transactionProfileRepo.findOne({
            where: {
                merchantId: merchantId
            }
        });
        if (transactionProfile == null) {
            return null;
        }

        return transactionProfile;
    }

    async AddProductsRequired(merchantId, body) {
        let transaction;

        try {
            transaction = await db.sequelize.transaction();

            const productsRequiredIds = body.productsRequiredIds;
            const resellerId = body.resellerId;

            const isDatman = resellerId === 2;
            const merchant = await merchantRepo.findOne({
                where: {
                    id: merchantId
                }
            });

            if (!merchant) return null;

            if (isDatman) {
                await updateRelationshipItems({
                    merchantId: merchantId,
                    itemsIds: productsRequiredIds,
                    repository: merchantProductRequiredRepo,
                    propertyName: 'productRequiredId',
                    transaction: transaction
                });
            } else {
                await updateMerchantProducts({
                    merchantId: merchantId,
                    itemsIds: productsRequiredIds,
                    repository: merchantProductRequiredRepo,
                    propertyName: 'productRequiredId',
                    transaction: transaction
                });
            }

            const onboardingStep =
                merchant.status === MerchantStatus.MERCHANT_PENDING ? 1 : Math.max(8, merchant.onboardingStep);

            await merchantRepo.update(
                merchant.id,
                {
                    onboardingStep: onboardingStep
                },
                transaction
            );

            await transaction.commit();

            return merchant;
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            throw error;
        }
    }

    async GetProductsRequired(merchantId) {
        const merchantProductsIds = (
            await merchantProductRequiredRepo.findAll({
                where: {
                    merchantId: merchantId
                }
            })
        ).map((m) => m.productRequiredId);

        return merchantProductsIds;
    }

    async updateDocuments(merchantId, event, userId) {
        let transaction;

        try {
            transaction = await db.sequelize.transaction();

            const merchant = await merchantRepo.findOne({
                where: {
                    id: merchantId
                }
            });

            if (!merchant) {
                return null;
            }

            const onboardingStep =
                merchant.status === MerchantStatus.MERCHANT_PENDING ? 1 : Math.max(9, merchant.onboardingStep);

            const updatedMerchant = await merchantRepo.update(
                merchant.id,
                {
                    onboardingStep: onboardingStep
                },
                transaction
            );
            const merchantUpdateDto = {
                beforeUpdate: merchant,
                afterUpdate: updatedMerchant,
                tableName: 'merchants'
            };
            const auditLogData = [merchantUpdateDto];

            await auditLog(auditLogData, event, userId, merchantId);
            await transaction.commit(auditLogData);

            return merchant;
        } catch (error) {
            console.error(error);
            if (transaction) {
                await transaction.rollback();
            }
            throw error;
        }
    }
}

const updateRelationshipItems = async (params) => {
    const { merchantId, itemsIds, repository, propertyName, transaction } = params;

    const existingItems = await repository.findAll({
        where: {
            merchantId: merchantId
        }
    });

    const newItems = itemsIds.filter((id) => !existingItems.some((e) => e[propertyName] === id));

    const deletedItems = existingItems
        .filter((e) => !itemsIds.some((id) => id === e[propertyName]))
        .map((e) => e[propertyName]);

    const deleteQuery = {
        where: {
            merchantId: merchantId
        }
    };
    deleteQuery.where[propertyName] = deletedItems;

    await repository.deleteAll(deleteQuery);

    for (var i = 0; i < newItems.length; ++i) {
        const itemId = newItems[i];

        const saveQuery = {
            merchantId: merchantId
        };
        saveQuery[propertyName] = itemId;

        await repository.save(saveQuery, transaction);
    }
};

const updateMerchantProducts = async (params) => {
    const { merchantId, itemsIds, repository, propertyName, transaction } = params;

    const existingItems = await repository.findAll({
        where: {
            merchantId: merchantId
        }
    });

    const newItems = itemsIds.filter((item) => !existingItems.some((e) => e[propertyName] === item.id));

    // eslint-disable-next-line
    const deletedItems = existingItems
        .filter((e) => !itemsIds.some((id) => id === e[propertyName]))
        .map((e) => e[propertyName]);

    // eslint-disable-next-line
    const deleteQuery = {
        where: {
            merchantId: merchantId
        }
    };

    const updateItems = itemsIds.filter((item) => existingItems.some((e) => e[propertyName] === item.id));
    //deleteQuery.where[propertyName] = deletedItems;
    console.log('updateItems', updateItems);
    //await repository.deleteAll(deleteQuery);

    var i;

    for (i = 0; i < newItems.length; ++i) {
        const itemId = newItems[i];

        const saveQuery = {
            merchantId: merchantId,
            status: itemId.status,
            additionalInfo: itemId.additionalInfo,
            productRequiredId: itemId.id
        };
        //saveQuery[propertyName] = itemId.id;

        await repository.save(saveQuery, transaction);
    }

    for (i = 0; i < updateItems.length; ++i) {
        const itemId = updateItems[i];

        const updateQuery = {
            merchantId: merchantId,
            status: itemId.status,
            additionalInfo: itemId.additionalInfo,
            productRequiredId: itemId.id
        };
        //saveQuery[propertyName] = itemId.id;

        await repository.update(updateQuery, transaction);
    }
};

const updateAdyenData = async (accountHolderDetails, merchantId) => {
    try {
        const axios = Axios.create();

        const payLoad = {
            accountHolderCode: merchantId,
            accountHolderDetails: { ...accountHolderDetails }
        };

        var config = {
            method: 'post',
            url: `${ADYEN_API_URL}/Account/v6/updateAccountHolder`,
            data: payLoad,
            headers: {
                'x-API-key': ADYEN_API_KEY,
                'Content-Type': 'application/json'
            }
        };

        const response = await axios(config);
        console.log('Adyen update response', response.data);
        return response.data;
    } catch (err) {
        const error = err?.response?.data?.invalidFields;
        console.log(`exception in adyen update data`, err, error);
    }
};
const auditLog = async (auditLogData, event, userId, merchantId) => {
    const auditLogDto = {
        data: {
            auditLogData,
            userId: userId,
            merchantId: merchantId,
            lambadaName: 'OnboardingUpdate',
            identity: event?.requestContext?.identity
        },
        queueUrl: process.env.AUDIT_LOGS_QUEUE_URL
    };
    await auditLogsPublisher(auditLogDto);
};
