import Axios from 'axios';

var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');

const {
    MerchantRepo,
    UserRepo,
    OwnersDetailsRepo,
    AddressRepo,
    BusinessDetailRepo,
    BusinessBankDetailsRepo,
    RelationshipRepo,
    DocumentRepo,
    AcquirerAccountConfigurationRepo,
    AdyenMerchantMetadataRepo
} = require('../../../libs/repo');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

const EXPIRE_TIME_SECONDS = 600; //considering worst case, At 50KBPS speed  , for a 30MB attatchment, give 10mins to upload
const { Op } = db.Sequelize;
const moment = require('moment');

const { BusinessTypeEnumId } = require('../helpers/businessType');
const { DatmanBusinessTypeIdToAdyenBusinessType } = require('../helpers/adyen-to-datman-business-type-map');
const { CountryISOCodeFromName, CountyCurrencyFromName } = require('../helpers/county-to-country-code');
const { MerchantCountries } = require('../helpers/MerchantCountries');
const { DocumentTypesId, DocumentTypesIdToName, DatmanDocumentTypesIdToName } = require('../helpers/documentType');
const { MerchantStatus } = require('../helpers/merchant-status');

const merchantRepo = new MerchantRepo(db);
const userRepo = new UserRepo(db);
const ownersDetailsRepo = new OwnersDetailsRepo(db);
const addressRepo = new AddressRepo(db);
const businessDetailRepo = new BusinessDetailRepo(db);
const businessBankDetailsRepo = new BusinessBankDetailsRepo(db);
const relationshipRepo = new RelationshipRepo(db);
const documentRepo = new DocumentRepo(db);
const acquirerAccountConfigurationRepo = new AcquirerAccountConfigurationRepo(db);
const adyenMerchantMetadataRepo = new AdyenMerchantMetadataRepo(db);

const ADYEN_API_KEY = process.env.ADYEN_API_KEY;
const ADYEN_API_URL = process.env.ADYEN_API_URL;
const FOOD_HUB_WEB_HOOK_URL = process.env.FOOD_HUB_WEB_HOOK_URL;
const FOOD_HUB_WEB_HOOK_API_KEY = process.env.FOOD_HUB_WEB_HOOK_API_KEY;
const { sequelize } = db;

const AWS = require('aws-sdk');
const s3Client = new AWS.S3({
    signatureVersion: 'v4'
});

const bucket = process.env.BUCKET_NAME;

export class AdyenService {
    async adyenOnboarding(merchantId, resellerId, adyenLevel, fhOnboarding = false) {
        let transaction = await sequelize.transaction();

        try {
            if (fhOnboarding) {
                const response = await getAdyenOnboardingPayload(merchantId, resellerId, adyenLevel, fhOnboarding);
                if (response.status && response.status === 400) {
                    return response;
                }
                const { bankDetailId, payLoad } = response;
                const axios = Axios.create();
                let config = {
                    method: 'post',
                    url: `${ADYEN_API_URL}/Account/v6/createAccountHolder`,
                    data: payLoad,
                    headers: {
                        'x-API-key': ADYEN_API_KEY,
                        'Content-Type': 'application/json'
                    }
                };
                const adyenAccount = await axios(config);
                const { accountCode, accountHolderDetails } = adyenAccount.data;
                console.log('onboarding response', adyenAccount.data);
                const { bankAccountUUID } = accountHolderDetails.bankAccountDetails[0];
                const shareholderCode = accountHolderDetails.businessDetails
                    ? accountHolderDetails.businessDetails.shareholders[0].shareholderCode
                    : null;
                const signatoryCode = accountHolderDetails.businessDetails
                    ? accountHolderDetails.businessDetails.signatories[0].signatoryCode
                    : null;
                const adyenAccountDto = {
                    merchantId: merchantId,
                    adyenSubAccountId: accountCode,
                    gateway: 'Adyen',
                    acquirer: 'Adyen',
                    accountStatus: 'ACTIVE',
                    payoutStatus: 'BLOCKED'
                };
                const bankDetailsDto = {
                    adyenBankUUID: bankAccountUUID
                };
                const adyenMetaDataDto = {
                    merchantId: merchantId,
                    metaData: JSON.stringify({
                        shareholderCode: shareholderCode,
                        signatoryCode: signatoryCode
                    })
                };
                await acquirerAccountConfigurationRepo.save(adyenAccountDto, transaction);
                await businessBankDetailsRepo.update(bankDetailId, bankDetailsDto, transaction);
                if (shareholderCode && signatoryCode) {
                    await adyenMerchantMetadataRepo.save(adyenMetaDataDto, transaction);
                }
                await fhWebHookNotify({
                    merchant_id: merchantId,
                    accountStatus: 'ACTIVE',
                    payoutStatus: 'BLOCKED'
                });
                await transaction.commit();
                return { accountCode: accountCode, status: 200 };
            } else {
                const documents = await this.getAdyenKYCDocuments(merchantId);
                const { allDocs, bankDocs, idProofDocs } = documents;

                if (allDocs.length === 0) {
                    return { message: 'No documents were found for this merchant', status: 400 };
                } else if (bankDocs.length === 0) {
                    return { message: 'No Bank documents found for this merchant', status: 400 };
                } else if (idProofDocs.length === 0) {
                    return { message: 'No Id proofs found for this merchant', status: 400 };
                } else {
                    const response = await getFilteredDocuments(merchantId, bankDocs, idProofDocs);
                    const { selectedBankDoc, selectedIDDocFront, selectedIDDocBack, errorMessage } = response;
                    if (errorMessage.length !== 0) {
                        return { errorMessage: errorMessage, status: 400 };
                    } else {
                        const response = await getAdyenOnboardingPayload(
                            merchantId,
                            resellerId,
                            adyenLevel,
                            fhOnboarding
                        );
                        if (response.status && response.status === 400) {
                            return response;
                        }
                        const { bankDetailId, payLoad } = response;
                        const axios = Axios.create();
                        let config = {
                            method: 'post',
                            url: `${ADYEN_API_URL}/Account/v6/createAccountHolder`,
                            data: payLoad,
                            headers: {
                                'x-API-key': ADYEN_API_KEY,
                                'Content-Type': 'application/json'
                            }
                        };
                        const adyenAccount = await axios(config);
                        const { accountCode, accountHolderDetails } = adyenAccount.data;
                        console.log('onboarding response', adyenAccount.data);
                        const { bankAccountUUID } = accountHolderDetails.bankAccountDetails[0];
                        const shareholderCode = accountHolderDetails.businessDetails
                            ? accountHolderDetails.businessDetails.shareholders[0].shareholderCode
                            : null;
                        const signatoryCode = accountHolderDetails.businessDetails
                            ? accountHolderDetails.businessDetails.signatories[0].signatoryCode
                            : null;
                        const adyenAccountDto = {
                            merchantId: merchantId,
                            adyenSubAccountId: accountCode,
                            gateway: 'Adyen',
                            acquirer: 'Adyen',
                            accountStatus: 'INACTIVE'
                        };
                        const bankDetailsDto = {
                            adyenBankUUID: bankAccountUUID
                        };
                        const adyenMetaDataDto = {
                            merchantId: merchantId,
                            metaData: JSON.stringify({
                                shareholderCode: shareholderCode,
                                signatoryCode: signatoryCode
                            })
                        };
                        await acquirerAccountConfigurationRepo.save(adyenAccountDto, transaction);
                        await businessBankDetailsRepo.update(bankDetailId, bankDetailsDto, transaction);
                        if (shareholderCode && signatoryCode) {
                            await adyenMerchantMetadataRepo.save(adyenMetaDataDto, transaction);
                        }

                        await uploadKycDocOnAdyen(merchantId, selectedBankDoc, true, bankAccountUUID);
                        await uploadKycDocOnAdyen(merchantId, selectedIDDocFront, false, null, true, shareholderCode);
                        if (selectedIDDocBack) {
                            await uploadKycDocOnAdyen(
                                merchantId,
                                selectedIDDocBack,
                                false,
                                null,
                                true,
                                shareholderCode
                            );
                        }
                        if (signatoryCode) {
                            await uploadKycDocOnAdyen(
                                merchantId,
                                selectedIDDocFront,
                                false,
                                null,
                                false,
                                null,
                                true,
                                signatoryCode
                            );
                            if (selectedIDDocBack) {
                                await uploadKycDocOnAdyen(
                                    merchantId,
                                    selectedIDDocBack,
                                    false,
                                    null,
                                    false,
                                    null,
                                    true,
                                    signatoryCode
                                );
                            }
                        }
                        await fhWebHookNotify({
                            merchant_id: merchantId,
                            accountStatus: 'ACTIVE',
                            payoutStatus: 'BLOCKED'
                        });
                        await transaction.commit();
                        return { accountCode: accountCode, status: 200 };
                    }
                }
            }
        } catch (err) {
            console.log(`exception in adyen onboarding`, err);
            if (transaction) {
                await transaction.rollback();
            }
            const error = err?.response?.data?.invalidFields;
            throw error;
        }
    }

    async getAllAdyenAccounts(merchantId) {
        const adyenAccount = await acquirerAccountConfigurationRepo.findOne({
            where: {
                merchantId: merchantId,
                acquirer: 'Adyen'
            }
        });
        let payoutReason = adyenAccount && adyenAccount.reason ? JSON.parse(adyenAccount?.reason) : null;
        const dtoAdyenAccounts = {
            merchantId: adyenAccount.merchantId,
            adyenSubAccountId: adyenAccount.adyenSubAccountId,
            gateway: adyenAccount.gateway,
            acquirer: adyenAccount.acquirer,
            productType: adyenAccount.productType,
            priority: adyenAccount.priority,
            accountStatus: adyenAccount.accountStatus,
            applicationId: adyenAccount.applicationId,
            reason: payoutReason,
            payoutStatus: adyenAccount.payoutStatus
        };
        return dtoAdyenAccounts;
    }

    async getAdyenKYCDocuments(merchantId) {
        const allDocs = await documentRepo.findAll({
            where: {
                merchantId: merchantId,
                status: { [Op.in]: ['NEED_APPROVAL', 'ACTIVE'] },
                documentTypeId: {
                    [Op.in]: [
                        DocumentTypesId.BANK_STATEMENT,
                        DocumentTypesId.VOID_CHEQUE,
                        DocumentTypesId.PASSPORT,
                        DocumentTypesId.DRIVING_LICENCE,
                        DocumentTypesId.ID_PROOF_FRONT,
                        DocumentTypesId.ID_PROOF_BACK
                    ]
                }
            }
        });

        const bankDocIds = [DocumentTypesId.BANK_STATEMENT, DocumentTypesId.VOID_CHEQUE];
        const idProofsIds = [
            DocumentTypesId.PASSPORT,
            DocumentTypesId.DRIVING_LICENCE,
            DocumentTypesId.ID_PROOF_FRONT,
            DocumentTypesId.ID_PROOF_BACK
        ];

        const bankDocs = allDocs.filter((doc) => bankDocIds.includes(doc.documentTypeId));

        const idProofDocs = allDocs.filter((doc) => idProofsIds.includes(doc.documentTypeId));

        return { allDocs: allDocs, bankDocs: bankDocs, idProofDocs: idProofDocs };
    }

    async uploadAdyenKYCDocs(merchantId, bankDocs, idProofDocs, bankAccountUUID, shareholderCode) {
        let selectedBankDoc;
        let selectedIdProofsDoc;
        const anyActiveBankDocs = bankDocs.filter((doc) => doc.status === 'ACTIVE');
        const anyActiveIdProofDocs = idProofDocs.filter((doc) => doc.status === 'ACTIVE');

        if (anyActiveBankDocs.length !== 0) {
            selectedBankDoc = anyActiveBankDocs[0];
        } else {
            selectedBankDoc = bankDocs[0];
        }

        if (anyActiveIdProofDocs.length !== 0) {
            selectedIdProofsDoc = anyActiveIdProofDocs[0];
        } else {
            selectedIdProofsDoc = idProofDocs[0];
        }

        await uploadKycDocOnAdyen(merchantId, selectedBankDoc, true, bankAccountUUID);
        await uploadKycDocOnAdyen(merchantId, selectedIdProofsDoc, false, null, true, shareholderCode);
    }

    async accountHolderCreatedWebhook(accountHolderCode, accountCode, status, allowPayout) {
        let transaction;
        let payoutStatus;
        payoutStatus = allowPayout ? 'OPEN' : 'BLOCKED';
        const adyenAccountHolder = await acquirerAccountConfigurationRepo.findOne({
            where: {
                merchantId: accountHolderCode
            }
        });
        if (adyenAccountHolder) {
            const UpdateDto = {
                merchantId: accountHolderCode,
                status,
                payoutStatus,
                acquirer: 'Adyen',
                transaction
            };
            await acquirerAccountConfigurationRepo.update(UpdateDto);
            return response({ error: 'Account Holder id already exists' }, 400);
        }
        try {
            transaction = await db.sequelize.transaction();

            const merchantRecord = await merchantRepo.findOne({
                where: {
                    id: parseInt(accountHolderCode)
                }
            });
            const dto = {
                merchantId: merchantRecord.id,
                adyenSubAccountId: accountCode,
                gateway: 'Adyen',
                acquirer: 'Adyen',
                accountStatus: status,
                payoutStatus: payoutStatus
            };
            await acquirerAccountConfigurationRepo.save(dto, transaction);
            await transaction.commit();

            const fhWebHookStatus = {
                merchant_id: merchantRecord.id,
                accountStatus: status,
                payoutStatus: payoutStatus,
                message: 'Merchant account created on adyen',
                acquirer: 'Adyen'
            };
            await fhWebHookNotify(fhWebHookStatus);

            return response({}, 201);
        } catch (err) {
            console.error(err);
            await transaction.rollback();
            return response({}, 500);
        }
    }
    async accountHolderUpdatedWebhook(accountHolderCode, status, allowPayout) {
        let transaction = await db.sequelize.transaction();
        try {
            const payoutStatus = allowPayout ? 'OPEN' : 'BLOCKED';
            const UpdateDto = {
                merchantId: accountHolderCode,
                status,
                payoutStatus,
                acquirer: 'Adyen',
                transaction
            };
            await acquirerAccountConfigurationRepo.update(UpdateDto);
            await transaction.commit();
            const fhWebHookStatus = {
                merchant_id: accountHolderCode,
                accountStatus: status,
                payoutStatus: payoutStatus,
                message: 'Merchant account updated on adyen',
                acquirer: 'Adyen'
            };
            await fhWebHookNotify(fhWebHookStatus);
            return response({}, 201);
        } catch (err) {
            console.error(err);
            await transaction.rollback();
            return response({}, 500);
        }
    }
    async accountHolderStatusChange(accountHolderCode, status, allowPayout) {
        let transaction = await db.sequelize.transaction();
        try {
            const payoutStatus = allowPayout ? 'OPEN' : 'BLOCKED';
            const statusChangeDto = {
                merchantId: accountHolderCode,
                status,
                transaction,
                payoutStatus,
                acquirer: 'Adyen'
            };
            await acquirerAccountConfigurationRepo.update(statusChangeDto);
            await transaction.commit();
            const fhWebHookStatus = {
                merchant_id: accountHolderCode,
                accountStatus: status,
                payoutStatus: payoutStatus,
                message: 'Merchant account status changed on adyen',
                acquirer: 'Adyen'
            };
            await fhWebHookNotify(fhWebHookStatus);
            return response({}, 201);
        } catch (err) {
            console.error(err);
            await transaction.rollback();
            return response({}, 500);
        }
    }

    async accountHolderVerificationWebhook(accountHolderCode, kycType, kycStatus) {
        let transaction = await db.sequelize.transaction();

        const adyenAccountHolder = await acquirerAccountConfigurationRepo.findOne({
            where: {
                merchantId: accountHolderCode
            }
        });
        let statusReason = JSON.parse(adyenAccountHolder.reason);
        statusReason[`${kycType}`] = kycStatus;

        let verificationDto = { merchantId: accountHolderCode, statusReason, acquirer: 'Adyen', transaction };
        try {
            await acquirerAccountConfigurationRepo.update(verificationDto);
            await transaction.commit();
            const fhWebHookStatus = {
                ...statusReason,
                merchant_id: accountHolderCode,
                accountStatus: adyenAccountHolder.accountStatus,
                payoutStatus: adyenAccountHolder.payoutStatus,
                message: 'Merchant account status changed on adyen',
                acquirer: 'Adyen'
            };
            await fhWebHookNotify(fhWebHookStatus);
            return response({}, 201);
        } catch (err) {
            console.error(err);
            await transaction.rollback();
            return response({}, 500);
        }
    }

    async updateAdyenMetadata(merchantId, resellerId, data) {
        try {
            const axios = Axios.create();
            const isBankUpdate = data?.bankAccountUUID ? true : false;

            const payLoad = await getUpdateAdyenDataPayload(merchantId, resellerId, data, isBankUpdate);
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
            console.log('adyen update metadata success', response.data);
            return response.data;
        } catch (err) {
            console.log(`exception in adyen update metadata`, err);
            const error = err?.response?.data?.invalidFields;
            throw error;
        }
    }

    async updateAdyenDocument(merchantId, documentId, data) {
        try {
            let bankAccountUUID = data?.bankAccountUUID;
            const document = await documentRepo.findOne({
                where: {
                    id: documentId
                }
            });

            const adyenMerchant = await adyenMerchantMetadataRepo.findOne({
                where: { merchantId: merchantId }
            });

            let shareholderCode;
            let signatoryCode;
            if (
                document.documentTypeId === DocumentTypesId.DRIVING_LICENCE ||
                document.documentTypeId === DocumentTypesId.PASSPORT ||
                document.documentTypeId === DocumentTypesId.ID_PROOF_BACK ||
                document.documentTypeId === DocumentTypesId.ID_PROOF_FRONT
            ) {
                const adyenMetadata = adyenMerchant?.metaData && JSON.parse(adyenMerchant?.metaData);
                shareholderCode = adyenMetadata?.shareholderCode;
                signatoryCode = adyenMetadata?.signatoryCode;
            }

            if (
                !bankAccountUUID &&
                (document.documentTypeId === DocumentTypesId.BANK_STATEMENT ||
                    document.documentTypeId === DocumentTypesId.VOID_CHEQUE)
            ) {
                const merchant = await merchantRepo.findOne({
                    where: { id: merchantId },
                    attributes: ['businessBankDetailsId']
                });

                const businessBankDetails = await businessBankDetailsRepo.findOne({
                    where: {
                        id: merchant.businessBankDetailsId
                    },
                    attributes: ['adyenBankUUID']
                });
                bankAccountUUID = businessBankDetails.adyenBankUUID;
            }

            const docResponse = await checkAdyenDocSize(document);

            if (docResponse) {
                return { message: docResponse, status: 400 };
            }

            let response;

            if (shareholderCode) {
                await uploadKycDocOnAdyen(merchantId, document, false, null, true, shareholderCode);
            }
            if (signatoryCode) {
                await uploadKycDocOnAdyen(merchantId, document, false, null, false, null, true, signatoryCode);
            }
            if (bankAccountUUID) {
                response = await uploadKycDocOnAdyen(merchantId, document, true, bankAccountUUID);
            }

            if (!shareholderCode && !signatoryCode && !bankAccountUUID) {
                response = await uploadKycDocOnAdyen(merchantId, document);
            }
            return response;
        } catch (err) {
            console.log(`exception in adyen upload document`, err);
            const error = err?.response?.data?.invalidFields;
            throw error;
        }
    }

    async getAdyenResponse(merchantId) {
        try {
            const payLoad = {
                accountHolderCode: merchantId
            };

            const axios = Axios.create();
            var config = {
                method: 'post',
                url: `${ADYEN_API_URL}/Account/v6/getAccountHolder`,
                data: payLoad,
                headers: {
                    'x-API-key': ADYEN_API_KEY,
                    'Content-Type': 'application/json'
                }
            };
            const response = await axios(config);
            return response.data;
        } catch (err) {
            console.log(`adyen response error`, err);
            const error = err?.response?.data;
            throw error;
        }
    }
}

const fetchTheMerchantData = async (merchantId, resellerId, bankUpdate = false) => {
    const relationship = await relationshipRepo.findOne({
        where: { merchantId: merchantId, resellerId: resellerId, roleId: 4 },
        attributes: ['userId']
    });
    const user = await userRepo.findByPk(relationship.userId);

    const merchant = await merchantRepo.findOne({
        where: { id: merchantId },
        attributes: [
            'id',
            'name',
            'baseAddressId',
            'tradingAddressId',
            'primaryOwnerId',
            'businessDetailId',
            'businessBankDetailsId',
            'country',
            'legalName',
            'status',
            'isBankAccountVerified',
            'isAccountVerified'
        ]
    });

    const ownerDetails = await ownersDetailsRepo.findOne({ where: { id: merchant.primaryOwnerId } });
    const ownerAddress = await addressRepo.findOne({ where: { id: ownerDetails.ownerAddressId } });

    if (bankUpdate) {
        return {
            merchant: merchant,
            ownerAddress: ownerAddress
        };
    }
    const businessDetails = await businessDetailRepo.findOne({ where: { id: merchant.businessDetailId } });
    const bankDetails = await businessBankDetailsRepo.findOne({
        where: { id: merchant.businessBankDetailsId }
    });

    let businessAddress = {};
    if (businessDetails.businessTypeId !== BusinessTypeEnumId.SOLE_TRADER) {
        businessAddress = await addressRepo.findOne({ where: { id: merchant.baseAddressId } });
    }

    return {
        merchant: merchant,
        user: user,
        businessDetails: businessDetails,
        bankDetails: bankDetails,
        ownerAddress: ownerAddress,
        businessAddress: businessAddress,
        ownerDetails: ownerDetails
    };
};

const getAdyenOnboardingPayload = async (merchantId, resellerId, adyenLevel, fhOnboarding) => {
    const {
        merchant,
        user,
        businessDetails,
        bankDetails,
        ownerAddress,
        businessAddress,
        ownerDetails
    } = await fetchTheMerchantData(merchantId, resellerId);

    if (merchant.country !== MerchantCountries.UNITED_KINGDOM && !fhOnboarding) {
        return { message: "Merchant's other than UK not allowed to create adyen account", status: 400 };
    } else if (merchant.status !== MerchantStatus.ACTIVE && !fhOnboarding) {
        return { message: 'Merchant is not active', status: 400 };
    } else if ((!merchant.isBankAccountVerified || !merchant.isAccountVerified) && !fhOnboarding) {
        return { message: 'Merchant is not completely verified', status: 400 };
    }

    let bankDto;
    if (MerchantCountries.UNITED_KINGDOM === merchant.country) {
        bankDto = { branchCode: bankDetails.sortCode, accountNumber: bankDetails.newAccountNumber };
    }

    // for future use for other countries
    // } else if (MerchantCountries.AUSTRALIA === merchant.country) {
    //     bankDto = { branchCode: bankDetails.bsb, accountNumber: bankDetails.newAccountNumber };
    // } else if (MerchantCountries.IRELAND === merchant.country) {
    //     bankDto = { iban: bankDetails.newAccountNumber };
    // } else if (MerchantCountries.UNITED_STATES === merchant.country) {
    //     bankDto = { branchCode: bankDetails.routingNumber, accountNumber: bankDetails.newAccountNumber };
    // } else if (MerchantCountries.CANADA === merchant.country) {
    //     bankDto = {
    //         branchCode: `${bankDetails.transitNumber}${bankDetails.financialInstitutionNumber}`,
    //         accountNumber: bankDetails.newAccountNumber
    //     };
    // } else if (MerchantCountries.MEXICO === merchant.country) {
    //     bankDto = { accountNumber: bankDetails.newAccountNumber };
    // } else if (MerchantCountries.NEW_ZEALAND === merchant.country) {
    //     bankDto = { accountNumber: bankDetails.newAccountNumber };
    // }

    const bankData = [
        {
            ...bankDto,
            countryCode: CountryISOCodeFromName[merchant.country],
            currencyCode: CountyCurrencyFromName[merchant.country],
            bankName: bankDetails.nameOfBank,
            ownerCity: ownerAddress.city?.trim() ? ownerAddress.city?.trim() : '-',
            ownerCountryCode: CountryISOCodeFromName[merchant.country],
            ownerHouseNumberOrName: ownerAddress.addressLine1,
            ownerName: bankDetails.accountHolderName,
            ownerPostalCode: ownerAddress.postCode,
            ownerStreet: ownerAddress.addressLine2 ? ownerAddress.addressLine2 : '-'
        }
    ];

    const phoneNumberData = {
        phoneNumber: ownerDetails.contactPhone,
        phoneCountryCode: CountryISOCodeFromName[merchant.country]
    };

    let email = ownerDetails.email;
    const dateOfBirth = ownerDetails.birthDate;
    const webAddress = businessDetails?.websiteUrl
        ? businessDetails?.websiteUrl.includes('https')
            ? businessDetails.websiteUrl
            : `https://${businessDetails?.websiteUrl}`
        : null;

    const ownerAddressDto = {
        city: ownerAddress.city?.trim() ? ownerAddress.city?.trim() : '-',
        country: CountryISOCodeFromName[merchant.country],
        postalCode: ownerAddress.postCode,
        // stateOrProvince: "NL",
        houseNumberOrName: ownerAddress.addressLine1,
        street: ownerAddress.addressLine2 ? ownerAddress.addressLine2 : '-'
    };

    const individualDetails = {
        name: {
            firstName: user.firstName,
            lastName: user.lastName
        },
        personalData: {
            dateOfBirth: ownerDetails.birthDate
        }
    };

    const legalEntity = DatmanBusinessTypeIdToAdyenBusinessType[businessDetails.businessTypeId];
    const processingTier = adyenLevel;

    let payLoad = {
        accountHolderCode: merchant.id,
        accountHolderDetails: {
            bankAccountDetails: bankData,
            dateOfBirth: dateOfBirth
        },
        legalEntity: legalEntity,
        processingTier: processingTier
    };

    if (businessDetails.businessTypeId === BusinessTypeEnumId.SOLE_TRADER) {
        payLoad = {
            ...payLoad,
            accountHolderDetails: {
                ...payLoad.accountHolderDetails,
                address: { ...ownerAddressDto },
                individualDetails: { ...individualDetails },
                phoneNumber: { ...phoneNumberData },
                email: email
            }
        };
    } else {
        const fullPhoneNumber = businessDetails.phoneNumber;
        const businessEmail = businessDetails.email;

        const businessDetailsDto = {
            legalBusinessName: merchant.legalName,
            doingBusinessAs: merchant.legalName,
            registrationNumber: businessDetails.registeredNumber,
            signatories: [
                {
                    name: {
                        firstName: user.firstName,
                        lastName: user.lastName
                    },
                    address: { ...ownerAddressDto },
                    email: email,
                    jobTitle: 'President',
                    personalData: {
                        dateOfBirth: dateOfBirth,
                        nationality: CountryISOCodeFromName[merchant.country]
                    }
                }
            ],
            shareholders: [
                {
                    name: {
                        firstName: user.firstName,
                        lastName: user.lastName
                    },
                    address: { ...ownerAddressDto },
                    email: email,
                    shareholderType: 'Owner',
                    personalData: {
                        dateOfBirth: dateOfBirth,
                        nationality: CountryISOCodeFromName[merchant.country]
                    }
                }
            ]
        };

        const businessAddressDto = {
            city: businessAddress.city?.trim() ? businessAddress.city?.trim() : '-',
            country: CountryISOCodeFromName[merchant.country],
            postalCode: businessAddress.postCode,
            stateOrProvince: CountryISOCodeFromName[merchant.country],
            houseNumberOrName: businessAddress.addressLine1,
            street: businessAddress.addressLine2 ? businessAddress.addressLine2 : '-'
        };

        payLoad = {
            ...payLoad,
            accountHolderDetails: {
                ...payLoad.accountHolderDetails,
                address: { ...businessAddressDto },
                businessDetails: { ...businessDetailsDto },
                webAddress: webAddress,
                fullPhoneNumber: fullPhoneNumber.startsWith('+') ? fullPhoneNumber : `+${fullPhoneNumber}`,
                email: businessEmail
            }
        };
    }

    return { bankDetailId: merchant.businessBankDetailsId, payLoad: payLoad };
};

const getFilteredDocuments = async (merchantId, bankDocs, idProofDocs) => {
    let selectedBankDoc;
    let selectedIdProofsDoc;
    const anyActiveBankDocs = bankDocs.filter((doc) => doc.status === 'ACTIVE');
    const anyActiveIdProofDocs = idProofDocs.filter((doc) => doc.status === 'ACTIVE');

    if (anyActiveBankDocs.length !== 0) {
        selectedBankDoc = anyActiveBankDocs[0];
    } else {
        selectedBankDoc = bankDocs[0];
    }

    if (anyActiveIdProofDocs.length !== 0) {
        selectedIdProofsDoc = anyActiveIdProofDocs[0];
    } else {
        selectedIdProofsDoc = idProofDocs[0];
    }

    let frontSideDoc;
    let backSideDoc;

    if (selectedIdProofsDoc.documentTypeId === DocumentTypesId.ID_PROOF_FRONT) {
        frontSideDoc = selectedIdProofsDoc;
        for (let i = 0; i < idProofDocs.length; i++) {
            if (idProofDocs[i].documentTypeId === DocumentTypesId.ID_PROOF_BACK) {
                backSideDoc = idProofDocs[i];
                break;
            }
        }
    }

    if (selectedIdProofsDoc.documentTypeId === DocumentTypesId.ID_PROOF_BACK) {
        backSideDoc = selectedIdProofsDoc;
        for (let i = 0; i < idProofDocs.length; i++) {
            if (idProofDocs[i].documentTypeId === DocumentTypesId.ID_PROOF_FRONT) {
                frontSideDoc = idProofDocs[i];
                break;
            }
        }
    }

    let selectedIDDocFront;
    let selectedIDDocBack;
    if (
        selectedIdProofsDoc.documentTypeId === DocumentTypesId.PASSPORT ||
        selectedIdProofsDoc.documentTypeId === DocumentTypesId.DRIVING_LICENCE
    ) {
        selectedIDDocFront = selectedIdProofsDoc;
    } else {
        selectedIDDocFront = frontSideDoc;
        selectedIDDocBack = backSideDoc;
    }

    let errorMessage = [];
    const bankResponse = await checkAdyenDocSize(selectedBankDoc);
    const idResponseFront = await checkAdyenDocSize(selectedIDDocFront);

    if (selectedIDDocBack) {
        const idResponseBack = await checkAdyenDocSize(selectedIDDocBack);
        if (idResponseBack) {
            errorMessage.push(idResponseBack);
        }
    }

    if (bankResponse) {
        errorMessage.push(bankResponse);
    }

    if (idResponseFront) {
        errorMessage.push(idResponseFront);
    }

    return {
        selectedBankDoc: selectedBankDoc,
        selectedIDDocFront: selectedIDDocFront,
        selectedIDDocBack: selectedIDDocBack,
        errorMessage: errorMessage
    };
};

const getUpdateAdyenDataPayload = async (merchantId, resellerId, data, isBankUpdate) => {
    const { merchant, ownerAddress } = await fetchTheMerchantData(merchantId, resellerId, isBankUpdate);

    // for future use for other countries
    // } else if (MerchantCountries.AUSTRALIA === merchant.country) {
    //     bankDto = { branchCode: data.newBsbCode,, accountNumber: data.newAccountNumber };
    // } else if (MerchantCountries.IRELAND === merchant.country) {
    //     bankDto = { iban: data.newAccountNumber };
    // } else if (MerchantCountries.UNITED_STATES === merchant.country) {
    //     bankDto = { branchCode: data.routingNumber, accountNumber: data.newAccountNumber };
    // } else if (MerchantCountries.CANADA === merchant.country) {
    //     bankDto = {
    //         branchCode: `${data.transitNumber}${data.financialInstitutionNumber}`,
    //         accountNumber: data.newAccountNumber
    //     };
    // } else if (MerchantCountries.MEXICO === merchant.country) {
    //     bankDto = { accountNumber: data.newAccountNumber };
    // } else if (MerchantCountries.NEW_ZEALAND === merchant.country) {
    //     bankDto = { accountNumber: data.newAccountNumber };
    // }

    let bankDto;
    if (MerchantCountries.UNITED_KINGDOM === merchant.country) {
        bankDto = { branchCode: data.sortCode, accountNumber: data.newAccountNumber };
    }

    const bankData = [
        {
            ...bankDto,
            countryCode: CountryISOCodeFromName[merchant.country],
            currencyCode: CountyCurrencyFromName[merchant.country],
            ownerCity: ownerAddress.city?.trim() ? ownerAddress.city?.trim() : '-',
            ownerCountryCode: CountryISOCodeFromName[merchant.country],
            ownerHouseNumberOrName: ownerAddress.addressLine1,
            ownerName: data.accountHolderName,
            ownerPostalCode: ownerAddress.postCode,
            ownerStreet: ownerAddress.addressLine2 ? ownerAddress.addressLine2 : '-',
            ownerNationality: CountryISOCodeFromName[merchant.country],
            bankAccountUUID: data.bankAccountUUID
        }
    ];

    const payLoad = {
        accountHolderCode: merchant.id,
        accountHolderDetails: {
            bankAccountDetails: bankData
        }
    };
    return payLoad;
};

const uploadKycDocOnAdyen = async (
    merchantId,
    selectedDoc,
    isBank = false,
    bankAccountUUID,
    isShareHolder = false,
    shareholderCode = null,
    isSignatory = false,
    signatoryCode = null
) => {
    const s3BParams = {
        Bucket: bucket,
        Key: `merchant/${merchantId}/${selectedDoc.id}/${selectedDoc.filename}`,
        Expires: EXPIRE_TIME_SECONDS
    };

    const axios = Axios.create();
    const presignedDocUrl = await s3Client.getSignedUrlPromise('getObject', s3BParams);

    let doc = await axios.get(presignedDocUrl, { responseType: 'arraybuffer' });
    let docBase64Image = Buffer.from(doc.data).toString('base64');

    let documentDetails = {
        accountHolderCode: merchantId,
        description: 'PASSED',
        documentType: DocumentTypesIdToName[selectedDoc.documentTypeId],
        filename: `${moment().valueOf()}_${selectedDoc.filename}`
    };

    if (isBank) {
        documentDetails = {
            ...documentDetails,
            bankAccountUUID: bankAccountUUID
        };
    }

    if (isShareHolder) {
        documentDetails = {
            ...documentDetails,
            shareholderCode: shareholderCode
        };
    }

    if (isSignatory) {
        documentDetails = {
            ...documentDetails,
            signatoryCode: signatoryCode
        };
    }

    const uploadDocPayload = {
        documentDetail: { ...documentDetails },
        documentContent: docBase64Image
    };

    const uploadDocConfig = {
        method: 'post',
        url: `${ADYEN_API_URL}/Account/v6/uploadDocument`,
        data: uploadDocPayload,
        headers: {
            'x-API-key': ADYEN_API_KEY,
            'Content-Type': 'application/json'
        }
    };

    let adyenDocUpload;

    adyenDocUpload = await axios(uploadDocConfig);

    if (isBank) {
        console.log('bank upload response', adyenDocUpload.data);
    } else {
        console.log('id proof upload response', adyenDocUpload.data);
    }

    return adyenDocUpload.data;
};

const checkAdyenDocSize = async (doc) => {
    const docSize = doc.size / 1000000;
    let errorMessage;

    if (docSize < 0.1) {
        errorMessage = `${
            DatmanDocumentTypesIdToName[doc.documentTypeId]
        } document is smaller. Minimum accepted size for Adyen is 100kb`;
    }

    if (docSize > 10) {
        errorMessage = `${
            DatmanDocumentTypesIdToName[doc.documentTypeId]
        } document is larger. Maximum accepted size for Adyen is 10mb`;
    }

    return errorMessage;
};

const fhWebHookNotify = async (params) => {
    const { merchant_id } = params;
    const merchant = await merchantRepo.findOne({
        where: { id: merchant_id },
        attributes: ['id', 'thirdPartyCustomer']
    });
    const payLoad = JSON.stringify({
        ...params,
        merchant_id: merchant_id.toString(),
        provider: 'Adyen',
        storeId: merchant.thirdPartyCustomer?.toString()
    });

    try {
        const axios = Axios.create();

        const fhWebHookConfig = {
            method: 'post',
            url: FOOD_HUB_WEB_HOOK_URL,
            data: payLoad,
            headers: {
                token: FOOD_HUB_WEB_HOOK_API_KEY,
                'Content-Type': 'application/json'
            }
        };

        const response = await axios(fhWebHookConfig);
        console.log(response.data);
    } catch (error) {
        const err = error?.response?.data || error;
        console.log('error in foodhub webhook', err);
    }
};
