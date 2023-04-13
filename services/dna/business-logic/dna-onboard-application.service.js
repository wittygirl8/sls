import Axios from 'axios';
import FormData from 'form-data';
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');

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
    DnaMerchantMetadataRepo,
    ResellerRepo
} = require('../../../libs/repo');
var { sendEmail, zohoDeskDatmanDnaOnboardingEmailTemplate } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);
const { Op } = db.Sequelize;
const { BusinessTypeEnumId, DnaBusinessType } = require('../../merchants/helpers/businessType');
const { MerchantCountries } = require('../../merchants/helpers/MerchantCountries');
const { DocumentTypesId, DatmanDocumentTypesIdToName, DnaDocumentTypes } = require('../helpers/documentType');
const { MerchantStatus } = require('../helpers/merchant-status');
const { DNAOnboardStatus } = require('../helpers/dnaOnboardStatus');
const { DNAEventStatus } = require('../helpers/dnaEventStatus');
const merchantRepo = new MerchantRepo(db);
const userRepo = new UserRepo(db);
const ownersDetailsRepo = new OwnersDetailsRepo(db);
const addressRepo = new AddressRepo(db);
const businessDetailRepo = new BusinessDetailRepo(db);
const businessBankDetailsRepo = new BusinessBankDetailsRepo(db);
const relationshipRepo = new RelationshipRepo(db);
const documentRepo = new DocumentRepo(db);
const acquirerAccountConfigurationRepo = new AcquirerAccountConfigurationRepo(db);
const dnaMerchantMetadataRepo = new DnaMerchantMetadataRepo(db);
const resellerRepo = new ResellerRepo(db);
var fs = require('fs');
const os = require('os');

const { sequelize } = db;
const AWS = require('aws-sdk');
const s3Client = new AWS.S3({
    signatureVersion: 'v4'
});

const bucket = process.env.BUCKET_NAME;
const DNA_AUTH_URL = process.env.DNA_AUTH_URL;
const DNA_API_USERNAME = process.env.DNA_API_USERNAME;
const DNA_API_PASSWORD = process.env.DNA_API_PASSWORD;
const DNA_API_URL = process.env.DNA_API_URL;
const DNA_CALLBACK_URL = process.env.DNA_CALLBACK_URL;
const tmpDirPath = os.tmpdir();
export class DnaOnboardApplicationService {
    async getMerchantInfo(merchantId) {
        const data = await merchantRepo.findOne({
            where: {
                id: merchantId
            },

            attributes: ['legalName', ['id', 'MerchantId']]
        });

        return data;
    }
    async dnaOnboarding(merchantId) {
        let transaction = await sequelize.transaction();
        try {
            const axios = Axios.create();
            const documents = await getDnaKYCDocuments(merchantId);
            const { allDocs, bankDocs, idProofDocs } = documents;
            if (allDocs.length === 0) {
                return { message: 'No documents were found for this merchant', status: 400 };
            } else if (bankDocs.length === 0) {
                return { message: 'No Bank documents found for this merchant', status: 400 };
            } else if (idProofDocs.length === 0) {
                return { message: 'No Id proofs found for this merchant', status: 400 };
            } else {
                const filteredDocs = await getFilteredDocuments(merchantId, bankDocs, idProofDocs);
                const { selectedBankDoc, selectedIDDocFront, selectedIDDocBack } = filteredDocs;

                const dnaApplication = await acquirerAccountConfigurationRepo.findOne({
                    where: {
                        merchantId: merchantId,
                        acquirer: 'DNA'
                    },
                    attributes: ['dnaApplicationId', 'applicationStatus', 'applicationReason']
                });

                const authtoken = await getDnaBearerToken('partners_onboarding');
                if (!dnaApplication) {
                    const response = await getDnaOnboardingPayload(merchantId);
                    if (response.status && response.status === 400) {
                        return response;
                    }
                    const payLoad = response;
                    const dnaApiResponse = await submitDnaApplication(authtoken, payLoad);
                    if (!dnaApiResponse.errors) {
                        await submitDnaDocuments(authtoken, merchantId, selectedBankDoc, dnaApiResponse.id);
                        await submitDnaDocuments(authtoken, merchantId, selectedIDDocFront, dnaApiResponse.id);
                        if (selectedIDDocBack) {
                            await submitDnaDocuments(authtoken, merchantId, selectedIDDocBack, dnaApiResponse.id);
                        }

                        await transaction.commit();
                        return {
                            dnaApplicationId: dnaApiResponse.id,
                            message: 'Successfully Onboarded Merchant to DNA Acquirer',
                            status: 200
                        };
                    } else {
                        return { errors: dnaApiResponse.errors, status: 400 };
                    }
                } else if (dnaApplication.applicationStatus === DNAEventStatus.NEED_ADDITIONAL_INFO) {
                    const bankDocResponse = await submitDnaDocuments(
                        authtoken,
                        merchantId,
                        selectedBankDoc,
                        dnaApplication.dnaApplicationId,
                        dnaApplication.applicationStatus
                    );

                    const idDocResponse = await submitDnaDocuments(
                        authtoken,
                        merchantId,
                        selectedIDDocFront,
                        dnaApplication.dnaApplicationId,
                        dnaApplication.applicationStatus
                    );

                    if (bankDocResponse.status === 200 && idDocResponse.status === 200) {
                        await axios.get(`${DNA_API_URL}/${dnaApplication.dnaApplicationId}/additional-info/provided`, {
                            headers: {
                                Authorization: `Bearer ${authtoken}`
                            }
                        });
                        let dnaUpdateDto = {
                            merchantId: merchantId,
                            applicationStatus: 'background_check',
                            applicationReason: 'Submitted Additional Info',
                            acquirer: 'DNA'
                        };
                        await acquirerAccountConfigurationRepo.update(dnaUpdateDto, transaction);
                    }
                    return { message: bankDocResponse.message, status: bankDocResponse.status };
                } else {
                    return { message: 'Merchant Already Onboarded', status: 400 };
                }
            }
        } catch (err) {
            console.log(`exception in dna onboarding`, err);
            if (transaction) {
                await transaction.rollback();
            }
        }
    }

    async getAllDnaAccounts(merchantId, canonicalResellerId, searchValue, applicationStatusFilter, limit, offset) {
        let merchantSearchWhereQuery;
        let searchTerm = searchValue;
        if (searchTerm?.length > 2) {
            searchTerm = '%' + searchTerm + '%';
        } else {
            searchTerm = '%';
        }

        merchantSearchWhereQuery = {
            [Op.or]: [{ '$Merchant.name$': { [Op.like]: searchTerm } }, { '$Merchant.id$': { [Op.like]: searchTerm } }]
        };
        let resellerMerchants = [];
        if (!canonicalResellerId && merchantId) {
            resellerMerchants.push({ id: merchantId });
        } else {
            resellerMerchants = await merchantRepo.findAll({
                where: {
                    canonicalResellerId: canonicalResellerId
                },
                attributes: ['id']
            });
        }

        let statusFilter = {};
        if (applicationStatusFilter && applicationStatusFilter !== 'all') {
            statusFilter = { applicationStatus: applicationStatusFilter };
        }
        let accountConfigurationSearchQwery = {
            merchantId: {
                [Op.in]: resellerMerchants.map((merchant) => merchant.id.toString())
            },
            acquirer: 'DNA',
            ...statusFilter
        };

        const dnaAccounts = await acquirerAccountConfigurationRepo.findAll({
            where: { ...accountConfigurationSearchQwery },
            offset: offset ? offset : null,
            limit: limit ? limit : null,
            order: [['created_at', 'DESC']],
            include: {
                model: db.Merchant,
                where: merchantSearchWhereQuery,
                attributes: ['name', 'id']
            }
        });
        const dnaAccountsCount = await acquirerAccountConfigurationRepo.count({
            where: { ...accountConfigurationSearchQwery },
            include: {
                model: db.Merchant,
                where: merchantSearchWhereQuery
            }
        });
        return { dnaAccounts: dnaAccounts, count: dnaAccountsCount };
    }
    async getDnaTerminals(merchantId, searchValue) {
        let searchTerm = searchValue;
        if (searchTerm?.length > 2) {
            searchTerm = '%' + searchTerm + '%';
        } else {
            searchTerm = '%';
        }

        const dnaTerminals = await dnaMerchantMetadataRepo.findAll({
            where: {
                merchantId: merchantId,
                terminalId: { [Op.like]: searchTerm }
            },
            attributes: ['merchant_id', 'terminal_id']
        });
        const dnaRequestStatus = await merchantRepo.findOne({
            where: {
                id: merchantId
            },
            attributes: ['onBoardRequest']
        });
        const dnaProductType = await acquirerAccountConfigurationRepo.findOne({
            where: {
                merchantId: merchantId,
                acquirer: 'DNA'
            },
            attributes: ['productType']
        });

        const dnaTerminalDto = {
            dnaTerminals: dnaTerminals,
            dnaRequestStatus: dnaRequestStatus,
            dnaProductType: dnaProductType ? dnaProductType.productType : null
        };
        return dnaTerminalDto;
    }

    async dnaOnboardorCancelRequest(merchantId, resellerId, merchantLegalName, dnaRequest) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
            const subject =
                dnaRequest === DNAOnboardStatus.ONBOARD_DNA_MERCHANT
                    ? `DNA Onboard Request - ${merchantId}`
                    : dnaRequest === DNAOnboardStatus.CANCEL_DNA_ONBOARD &&
                      `DNA Onboard Request Cancelled - ${merchantId}`;
            await merchantRepo.update(
                merchantId,
                {
                    onBoardRequest: dnaRequest
                },
                transaction
            );
            await transaction.commit();
            const reseller = await resellerRepo.findOne({ where: { id: resellerId } });
            const resellerBrandingObj = {
                resellerLogo: reseller.logo,
                resellerContactUsPage: reseller.contactUsPageURL,
                portalURL: reseller.portalURL,
                resellerName: reseller.name,
                email: reseller.suportEmail,
                termAndCondPageUrl: reseller.termAndCondPageUrl,
                supportTelNo: reseller.supportTelNo,
                brandingURL: reseller.brandingURL,
                senderEmail: reseller.senderEmail,
                website: reseller.website,
                address: reseller.address
            };
            const emailTemplate = zohoDeskDatmanDnaOnboardingEmailTemplate({
                merchantId,
                merchantLegalName,
                dnaRequest
            });
            await sendEmail({
                email: resellerBrandingObj.email,
                subject: subject,
                message: emailTemplate,
                resellerBrandingObj
            });
        } catch (error) {
            console.log(error);
            if (transaction) {
                await transaction.rollback();
            }
            return error;
        }
    }
}

const submitDnaDocuments = async (authtoken, merchantId, selectedDoc, applicationId, applicationStatus) => {
    let docName = DatmanDocumentTypesIdToName[selectedDoc?.documentTypeId];
    let docType = DnaDocumentTypes[docName];
    try {
        const s3BParams = {
            Bucket: bucket,
            Key: `merchant/${merchantId}/${selectedDoc.id}/${selectedDoc.filename}`
        };
        const docData = await s3Client
            .getObject(s3BParams, function (error, data) {
                if (error != null) {
                    console.log('Failed to retrieve an object: ' + error);
                } else {
                    console.log('Loaded ' + data + ' bytes');
                    return data.Body;
                }
            })
            .promise();
        const imageBuffer = Buffer.from(docData.Body, 'binary');
        if (!fs.existsSync(`${tmpDirPath}/dna_kyc_docs`)) {
            fs.mkdirSync(`${tmpDirPath}/dna_kyc_docs`);
        }

        fs.writeFileSync(`${tmpDirPath}/dna_kyc_docs/${selectedDoc.filename}`, imageBuffer);
        let uploadResponse;

        uploadResponse = await uploadDocuments(
            authtoken,
            applicationId,
            selectedDoc.filename,
            docType,
            docName,
            applicationStatus
        );
        fs.rmdirSync(`${tmpDirPath}/dna_kyc_docs/${selectedDoc.filename}`, { recursive: true });
        return uploadResponse;
    } catch (error) {
        console.log(error);
        return error.response.data;
    }
};

const uploadDocuments = async (accessToken, applicationId, fileName, docType, docName, applicationStatus) => {
    try {
        let submitDnaDocsResponse;
        let submitAdditionalInfo;
        const axios = Axios.create();
        const form = new FormData();
        form.append('file', fs.createReadStream(`${tmpDirPath}/dna_kyc_docs/${fileName}`), fileName);
        form.append('type', docType);
        if (applicationStatus && applicationStatus === DNAEventStatus.NEED_ADDITIONAL_INFO) {
            form.append('comments', docName);
            submitAdditionalInfo = await axios.post(`${DNA_API_URL}/${applicationId}/additional-info`, form, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    ...form.getHeaders()
                }
            });
        } else {
            submitDnaDocsResponse = await axios.post(`${DNA_API_URL}/${applicationId}/documents`, form, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    ...form.getHeaders()
                }
            });
        }

        if (submitDnaDocsResponse?.status === 200) {
            return { message: 'Successfully Uploaded KYC Documents', status: 200 };
        } else if (submitAdditionalInfo?.status === 200) {
            return { message: 'Successfully Submitted Additional Info', status: 200 };
        }
    } catch (error) {
        return { message: 'Failed to Upload KYC Docs', status: 400 };
    }
};

const formUrlEncoded = (x) => Object.keys(x).reduce((p, c) => p + `&${c}=${encodeURIComponent(x[c])}`, '');

export const getDnaBearerToken = async (scope) => {
    try {
        const axios = Axios.create();
        const response = await axios.post(
            `${DNA_AUTH_URL}`,
            formUrlEncoded({
                client_id: DNA_API_USERNAME,
                client_secret: DNA_API_PASSWORD,
                grant_type: 'client_credentials',
                scope
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        return response.data.access_token;
    } catch (error) {
        console.log(error);
        return error.response.data;
    }
};

export const getDnaAgreement = async (merchantId, authtoken) => {
    try {
        const dnaApplicationId = await acquirerAccountConfigurationRepo.findOne({
            where: {
                merchantId: merchantId,
                acquirer: 'dna'
            },
            attributes: ['dnaApplicationId']
        });
        const axios = Axios.create();
        let config = {
            method: 'get',
            url: `${DNA_API_URL}/${dnaApplicationId}/msa`,
            headers: {
                Authorization: `Bearer ${authtoken}`,
                'Content-Type': 'application/json'
            }
        };
        const dnaApplicationResponse = await axios(config);
        return dnaApplicationResponse;
    } catch (error) {
        console.log('error in Agreement Download', error);
    }
};

export const submitDnaApplication = async (accessToken, payLoad) => {
    try {
        const axios = Axios.create();
        let config = {
            method: 'post',
            url: DNA_API_URL,
            data: payLoad,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        };
        const dnaApplicationResponse = await axios(config);
        return dnaApplicationResponse.data;
    } catch (error) {
        console.log('error in onboarding redirection', error);
        return error.response.data;
    }
};

const getDnaKYCDocuments = async (merchantId) => {
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
                    DocumentTypesId.ID_PROOF_BACK,
                    DocumentTypesId.BUSINESS_RATES_BILL,
                    DocumentTypesId.RESIDENCY_PERMIT
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
};

const fetchTheMerchantData = async (merchantId, bankUpdate = false) => {
    const relationship = await relationshipRepo.findOne({
        where: { merchantId: merchantId, roleId: 4 },
        attributes: ['userId', 'resellerId']
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

    const tradingAddress = await await addressRepo.findOne({ where: { id: merchant.tradingAddressId } });

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
        ownerDetails: ownerDetails,
        tradingAddress: tradingAddress
    };
};

const getDnaOnboardingPayload = async (merchantId) => {
    const {
        merchant,
        businessDetails,
        bankDetails,
        ownerAddress,
        businessAddress,
        ownerDetails,
        tradingAddress
    } = await fetchTheMerchantData(merchantId);

    if (merchant.country !== MerchantCountries.UNITED_KINGDOM) {
        return { message: "Merchant's other than UK not allowed to create dna account", status: 400 };
    } else if (merchant.status !== MerchantStatus.ACTIVE) {
        return { message: 'Merchant is not active', status: 400 };
    } else if (!merchant.isBankAccountVerified || !merchant.isAccountVerified) {
        return { message: 'Merchant is not completely verified', status: 400 };
    }

    const callbackUrl = DNA_CALLBACK_URL.replace('{merchantId}', merchantId);

    let payLoad = {
        deviceId: '1',
        partnerMerchantId: merchant.id.toString(),
        productType: 'ecom',
        callbackUrl: callbackUrl
    };
    const incorporationDate = businessDetails.creationDate ? businessDetails.creationDate : '22-02-2009';
    let businessType = DnaBusinessType[businessDetails.businessTypeId];
    if (
        DnaBusinessType[businessDetails.businessTypeId] === DnaBusinessType[BusinessTypeEnumId.LIMITED] &&
        !businessDetails.registeredNumber
    ) {
        return { message: 'Company Registration Number is missing', status: 400 };
    }

    const companyDto = {
        dnaAcquirer: {
            monthlyTurnover: '0',
            annualTurnover: '0',
            monthlyTransactionsCount: '0',
            annualTransactionsCount: '0',
            minTransactionValue: '0',
            averageTransactionValue: '0',
            maxTransactionValue: '0'
        },
        applicationDeclaration: true,
        privacyPolicy: true,
        businessType: businessType,
        fullLegalName: merchant.legalName,
        houseNameOrNumber: businessAddress.addressLine1,
        companyNumber: businessType === 'company' ? businessDetails.registeredNumber : null,
        tradingName: businessDetails.tradingName,
        tradingFrom: incorporationDate,
        incorporationDate: incorporationDate,
        bankAccountDetails: {
            type: businessType === 'company' ? 'business' : 'personal',
            accountName: bankDetails.accountHolderName,
            bankName: bankDetails.nameOfBank,
            accountNumber: bankDetails.newAccountNumber,
            sortCode: bankDetails.sortCode
        },
        companyAddress: {
            country: businessAddress.country,
            postalCode: businessAddress.postCode,
            addressLine1: businessAddress.addressLine1,
            addressLine2: businessAddress.addressLine2,
            townOrCity: businessAddress.townOrCity ? businessAddress.townOrCity : '',
            countyOrState: businessAddress.state
        },
        tradingAddress: {
            country: tradingAddress.country,
            postalCode: tradingAddress.postCode,
            addressLine1: tradingAddress.addressLine1,
            addressLine2: tradingAddress.addressLine2,
            townOrCity: tradingAddress.townOrCity,
            countyOrState: tradingAddress.state
        },
        emailAddress: businessDetails.email,
        telephoneNumber: businessDetails.phoneNumber,
        website: businessDetails.websiteUrl
    };
    const dates = ownerDetails.birthDate.split('-');
    const OwnerName = ownerDetails.fullName.split(' ');
    const companyOwners = [
        {
            firstName: OwnerName[0],
            middleName: OwnerName[1] ? OwnerName[1] : ' ',
            surname: OwnerName[2] ? OwnerName[2] : ' ',
            dateOfBirth: {
                year: parseInt(dates[0]),
                month: parseInt(dates[1]),
                day: parseInt(dates[2])
            },
            gender: ownerDetails.title === 'Miss' || ownerDetails.title === 'Mrs' ? 'F' : 'M',
            nationality: ownerDetails.nationality,
            ownership: 'ownerDetails.ownership',
            emailAddress: ownerDetails.email,
            telephoneNumber: ownerDetails.contactPhone,
            residentialAddress: {
                houseNameOrNumber: ownerAddress.addressLine1,
                country: ownerAddress.country,
                postalCode: ownerAddress.postCode,
                addressLine1: ownerAddress.addressLine1,
                addressLine2: ownerAddress.addressLine1,
                townOrCity: ownerAddress.city,
                countyOrState: ownerAddress.state
            }
        }
    ];

    payLoad = {
        ...payLoad,
        company: { ...companyDto },
        companyOwners: [...companyOwners],
        companyDirectors: [...companyOwners]
    };
    return payLoad;
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

    return {
        selectedBankDoc: selectedBankDoc,
        selectedIDDocFront: selectedIDDocFront,
        selectedIDDocBack: selectedIDDocBack
    };
};
