const { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const { MerchantCountries } = require('../helpers/MerchantCountries');
const {
    MerchantRepo,
    BusinessBankDetailsRepo,
    BankDetailsUpdateRequestRepo,
    DocumentRepo,
    AcquirerAccountConfigurationRepo,
    OwnersDetailsRepo
} = require('../../../libs/repo');
const { auditLogsPublisher, documentHelpers } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');

const { UpdateBankDetailsAccountStatus } = require('../helpers/update-bank-details-account-status');
import Axios from 'axios';
const { DocumentStatus } = require('../helpers/document-status');
const { AdyenAccountStatus } = require('../helpers/adyen-status');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);
const { Op } = db.Sequelize;
const BANK_VALIDATION_UK_API_ENDPOINT = process.env.BANK_VALIDATION_UK_API_ENDPOINT;
const BANK_VALIDATION_UK_API_KEY = process.env.BANK_VALIDATION_UK_API_KEY;

const { MerchantStatus } = require('../helpers/merchant-status');

const merchantRepo = new MerchantRepo(db);
const businessBankDetailsRepo = new BusinessBankDetailsRepo(db);
const bankDetailsUpdateRequestRepo = new BankDetailsUpdateRequestRepo(db);
const documentRepo = new DocumentRepo(db);
const acquirerAccountConfigurationRepo = new AcquirerAccountConfigurationRepo(db);
const ownerDetailsRepo = new OwnersDetailsRepo(db);
const ADYEN_UPDATE_METADATA = process.env.ADYEN_UPDATE_METADATA;
const BANK_TOKENIZATION_API_URL = process.env.BANK_TOKENIZATION_API_URL;
const BANK_TOKENIZATION_API_KEY = process.env.BANK_TOKENIZATION_API_KEY;
export class BankService {
    async UpdateBankDetails(merchantId, userId, documentId, event, resellerId) {
        let transaction;

        try {
            transaction = await db.sequelize.transaction();
            let auditLogData = [];

            const merchant = await merchantRepo.findOne({
                where: {
                    id: merchantId
                }
            });

            const updatedBankDetails = await bankDetailsUpdateRequestRepo.findOne({
                where: {
                    merchantId: merchantId,
                    approvalStatus: UpdateBankDetailsAccountStatus.WAITING_APPROVAL
                }
            });

            if (!merchant || !updatedBankDetails) {
                return null;
            }

            const existingDocuments = await documentRepo.findAll({
                where: {
                    merchantId: merchantId,
                    status: { [Op.in]: [DocumentStatus.ACTIVE, DocumentStatus.NEED_APPROVAL] },
                    documentTypeId: { [Op.in]: [1, 8] }
                }
            });

            if (existingDocuments) {
                let existingDocumentIds = [];
                for (let i = 0; i < existingDocuments.length; i++) {
                    if (existingDocuments[i].id !== documentId) {
                        existingDocumentIds.push(existingDocuments[i].id);
                    }
                }

                const where = {
                    id: {
                        [Op.in]: existingDocumentIds // this will update all the records with an id from the list
                    }
                };

                await documentRepo.updateAll(where, { status: DocumentStatus.OLD }, transaction);
            }

            let businessBankDetailsId = merchant.businessBankDetailsId;
            let businessBankDetails;

            const bankAccountDto = {
                bsb: updatedBankDetails.bsb,
                sortCode: updatedBankDetails.sortCode,
                newAccountNumber: updatedBankDetails.newAccountNumber,
                accountHolderName: updatedBankDetails.accountHolderName,
                routingNumber: updatedBankDetails.routingNumber,
                transitNumber: updatedBankDetails.transitNumber,
                financialInstitutionNumber: updatedBankDetails.financialInstitutionNumber
            };

            const updateBankDetailsRequestDto = {
                approvalStatus: UpdateBankDetailsAccountStatus.APPROVED,
                status: 'Verified'
            };

            if (!businessBankDetailsId) {
                businessBankDetails = await businessBankDetailsRepo.save(bankAccountDto, transaction);
                businessBankDetailsId = businessBankDetails.id;
            } else {
                const existingBankDetails = await businessBankDetailsRepo.findOne({
                    where: {
                        id: businessBankDetailsId
                    }
                });

                businessBankDetails = await businessBankDetailsRepo.update(
                    businessBankDetailsId,
                    bankAccountDto,
                    transaction
                );

                const bankUpdateAuditLogDto = {
                    beforeUpdate: existingBankDetails,
                    afterUpdate: businessBankDetails,
                    tableName: 'business_bank_details'
                };
                auditLogData.push(bankUpdateAuditLogDto);

                await db.BankDetailsChangeLog.create(
                    {
                        merchantId: merchantId,
                        requestedBy: userId,
                        oldAccountNumber: existingBankDetails
                            ? existingBankDetails.newAccountNumber.slice(
                                  existingBankDetails.newAccountNumber.length - 4
                              )
                            : '',
                        newAccountNumber: updatedBankDetails.newAccountNumber.slice(
                            updatedBankDetails.newAccountNumber.length - 4
                        )
                    },
                    {
                        transaction: transaction
                    }
                );

                const adyenMerchant = await acquirerAccountConfigurationRepo.findOne({
                    where: { merchantId: merchantId }
                });

                if (
                    existingBankDetails?.adyenBankUUID &&
                    adyenMerchant?.accountStatus !== AdyenAccountStatus.SUSPENDED &&
                    adyenMerchant?.accountStatus !== AdyenAccountStatus.CLOSED
                ) {
                    const axios = Axios.create();
                    const payLoad = {
                        ...bankAccountDto,
                        bankAccountUUID: existingBankDetails.adyenBankUUID
                    };

                    var config = {
                        method: 'post',
                        url: `${ADYEN_UPDATE_METADATA}/${merchantId}/${resellerId}`,
                        data: JSON.stringify(payLoad),
                        headers: {
                            Authorization: event.headers['Authorization'],
                            'Content-Type': 'application/json'
                        }
                    };

                    await axios(config);
                }
            }

            const uploadedNewDocument = await documentRepo.findOne({ where: { id: documentId } });
            const existingDoc = { ...JSON.parse(JSON.stringify(uploadedNewDocument)) };
            const updatedDoc = await documentRepo.update(
                uploadedNewDocument,
                {
                    status: DocumentStatus.ACTIVE
                },
                transaction
            );

            const docUpdateDto = {
                beforeUpdate: existingDoc,
                afterUpdate: { ...JSON.parse(JSON.stringify(updatedDoc)) },
                tableName: 'documents'
            };
            auditLogData.push(docUpdateDto);

            const updatedBankUpdateDetailRequest = await bankDetailsUpdateRequestRepo.update(
                updatedBankDetails.id,
                updateBankDetailsRequestDto,
                transaction
            );
            const bankDetilasUpdateRequestDto = {
                beforeUpdate: updatedBankDetails,
                afterUpdate: updatedBankUpdateDetailRequest,
                tableName: 'bank_details_update_requests'
            };

            auditLogData.push(bankDetilasUpdateRequestDto);

            const updatedMerchants = await merchantRepo.update(
                merchantId,
                {
                    isBankAccountVerified: '1',
                    businessBankDetailsId: businessBankDetailsId,
                    accountStatus: 'ApprovedBankDetails'
                },
                transaction
            );

            const merchantUpdateDto = {
                beforeUpdate: merchant,
                afterUpdate: updatedMerchants,
                tableName: 'merchants'
            };

            auditLogData.push(merchantUpdateDto);
            const auditLogDto = {
                data: {
                    auditLogData,
                    userId: userId,
                    merchantId: merchantId,
                    lambadaName: 'UpdateBankDetails',
                    identity: event?.requestContext?.identity
                },
                queueUrl: process.env.AUDIT_LOGS_QUEUE_URL
            };
            await auditLogsPublisher(auditLogDto);

            if (merchant.country === MerchantCountries.AUSTRALIA) {
                await bankTokenisation(merchantId);
            }
            await transaction.commit();

            return businessBankDetails;
        } catch (error) {
            console.log(error);
            if (transaction) {
                await transaction.rollback();
            }
            throw error;
        }
    }

    async RequestForUpdateBankDetails(merchantId, data, event, userId) {
        let transaction;

        try {
            transaction = await db.sequelize.transaction();
            let auditLogData = [];

            const merchant = await merchantRepo.findOne({
                where: {
                    id: merchantId
                }
            });

            if (merchant.status === MerchantStatus.WATCHLIST) {
                return { message: 'Bank Update is not available at this time' };
            }

            const existingUpdateRequest = await bankDetailsUpdateRequestRepo.findOne({
                where: {
                    merchantId: merchantId,
                    approvalStatus: UpdateBankDetailsAccountStatus.WAITING_APPROVAL
                }
            });

            if (!merchant) {
                return null;
            }

            if (existingUpdateRequest) {
                const updatedBankUpdateDetailRequest = await bankDetailsUpdateRequestRepo.update(
                    existingUpdateRequest.id,
                    {
                        approvalStatus: UpdateBankDetailsAccountStatus.OVERRIDDEN
                    },
                    transaction
                );
                const bankDetilasUpdateRequestDto = {
                    beforeUpdate: existingUpdateRequest,
                    afterUpdate: updatedBankUpdateDetailRequest,
                    tableName: 'bank_details_update_requests'
                };

                auditLogData.push(bankDetilasUpdateRequestDto);
            }

            const existingDocuments = await documentRepo.findAll({
                where: {
                    merchantId: merchantId,
                    status: DocumentStatus.NEED_APPROVAL,
                    flag: 'BANK_VERIFY'
                }
            });

            if (existingDocuments) {
                let existingDocumentIds = [];
                for (let i = 0; i < existingDocuments.length; i++) {
                    existingDocumentIds.push(existingDocuments[i].id);
                }

                const where = {
                    id: {
                        [Op.in]: existingDocumentIds
                    }
                };

                await documentRepo.updateAll(where, { status: DocumentStatus.OVERRIDDEN }, transaction);
            }

            const updateBankAccountRequestDto = {
                bsb: data.newBsbCode,
                sortCode: data.newSortCode,
                newAccountNumber: data.newAccountNumber,
                accountHolderName: data.accountHolderName,
                approvalStatus: UpdateBankDetailsAccountStatus.WAITING_APPROVAL,
                merchantId: merchantId,
                routingNumber: data.routingNumber,
                transitNumber: data.transitNumber,
                financialInstitutionNumber: data.financialInstitutionNumber
            };

            const updatedBankDetails = await bankDetailsUpdateRequestRepo.save(
                updateBankAccountRequestDto,
                transaction
            );

            //reset to bank verfication and allow withdrawal flag to false
            const updatedMerchants = await merchantRepo.update(
                merchantId,
                {
                    allowWithdrawals: '0',
                    isBankAccountVerified: '0',
                    accountStatus: 'BankDocumentUploadPending'
                },
                transaction
            );

            if (!existingUpdateRequest) {
                const merchantUpdateDto = {
                    beforeUpdate: merchant,
                    afterUpdate: updatedMerchants,
                    tableName: 'merchants'
                };
                auditLogData.push(merchantUpdateDto);
            }
            for (const eachDoc of data.newBankDocs) {
                const { id: documentId, filename, filesize, documentTypeId, entity, entityId, flag } = eachDoc;
                let entityIdColumn;
                if (entity === 'merchant') {
                    entityIdColumn = 'merchantId';
                }
                const documentDto = {
                    [entityIdColumn]: entityId,
                    filename: filename,
                    size: filesize,
                    id: documentId,
                    flag: flag,
                    documentTypeId: documentTypeId,
                    status: DocumentStatus.NEED_APPROVAL
                };
                const docUpdateDto = await documentHelpers.createNewDocument(db, documentDto, transaction);
                auditLogData.push(docUpdateDto);
            }
            const auditLogDto = {
                data: {
                    auditLogData,
                    userId: userId,
                    merchantId: merchantId,
                    lambadaName: 'RequestForUpdateBankDetails',
                    identity: event.requestContext.identity
                },
                queueUrl: process.env.AUDIT_LOGS_QUEUE_URL
            };
            await auditLogsPublisher(auditLogDto);

            await transaction.commit();

            return updatedBankDetails;
        } catch (error) {
            console.log(error);
            if (transaction) {
                await transaction.rollback();
            }
            throw error;
        }
    }

    async getRequestedNewBankDetails(merchantId) {
        try {
            const merchant = await merchantRepo.findOne({
                where: {
                    id: merchantId
                }
            });

            if (!merchant) {
                return null;
            }

            const existingUpdateRequest = await bankDetailsUpdateRequestRepo.findOne({
                where: {
                    merchantId: merchantId,
                    approvalStatus: UpdateBankDetailsAccountStatus.WAITING_APPROVAL
                }
            });

            return existingUpdateRequest;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async RejectUpdateBankDetailsRequest(merchantId, documentId, event, userId) {
        let transaction;

        try {
            transaction = await db.sequelize.transaction();

            const merchant = await merchantRepo.findOne({
                where: {
                    id: merchantId
                }
            });

            const existingUpdateRequest = await bankDetailsUpdateRequestRepo.findOne({
                where: {
                    merchantId: merchantId,
                    approvalStatus: UpdateBankDetailsAccountStatus.WAITING_APPROVAL
                }
            });

            if (!merchant || !existingUpdateRequest) {
                return null;
            }

            const uploadedNewDocument = await documentRepo.findOne({ where: { id: documentId } });
            const existingDoc = { ...JSON.parse(JSON.stringify(uploadedNewDocument)) };
            const updatedDoc = await documentRepo.update(
                uploadedNewDocument,
                {
                    status: DocumentStatus.REJECTED
                },
                transaction
            );
            let auditLogData = [];
            const docuemntUpdateDto = {
                beforeUpdate: existingDoc,
                afterUpdate: { ...JSON.parse(JSON.stringify(updatedDoc)) },
                tableName: 'documents'
            };
            auditLogData.push(docuemntUpdateDto);

            const rejectedBankDetails = await bankDetailsUpdateRequestRepo.update(
                existingUpdateRequest.id,
                {
                    approvalStatus: UpdateBankDetailsAccountStatus.REJECTED
                },
                transaction
            );

            const bankDetilasUpdateRequestDto = {
                beforeUpdate: existingUpdateRequest,
                afterUpdate: rejectedBankDetails,
                tableName: 'bank_details_update_requests'
            };

            auditLogData.push(bankDetilasUpdateRequestDto);

            //reset to bank verfication and allow withdrawal flag to false
            const updatedMerchant = await merchantRepo.update(
                merchantId,
                {
                    allowWithdrawals: '0',
                    isBankAccountVerified: '0',
                    accountStatus: 'NewBankDocumentRejected'
                },
                transaction
            );

            const merchantUpdateDto = {
                beforeUpdate: merchant,
                afterUpdate: updatedMerchant,
                tableName: 'merchants'
            };
            auditLogData.push(merchantUpdateDto);

            const auditLogDto = {
                data: {
                    auditLogData,
                    userId: userId,
                    merchantId: merchantId,
                    lambadaName: 'RequestForUpdateBankDetailsRejected',
                    identity: event.requestContext.identity
                },
                queueUrl: process.env.AUDIT_LOGS_QUEUE_URL
            };
            await auditLogsPublisher(auditLogDto);
            await transaction.commit();

            return rejectedBankDetails;
        } catch (error) {
            console.log(error);
            if (transaction) {
                await transaction.rollback();
            }
            throw error;
        }
    }

    async GetBankDetails(merchantId) {
        const merchant = await merchantRepo.findOne({
            where: {
                id: { [Op.eq]: merchantId }
            }
        });
        if (!merchant) {
            return null;
        }

        const businessBankDetails =
            merchant.businessBankDetailsId &&
            (await businessBankDetailsRepo.findOne({
                where: {
                    id: merchant.businessBankDetailsId
                }
            }));

        if (!businessBankDetails) {
            return {
                sortCode: '',
                newAccountNumber: '',
                accountHolderName: '',
                routingNumber: '',
                bsb: '',
                transitNumber: '',
                financialInstitutionNumber: ''
            };
        }

        return {
            sortCode: businessBankDetails ? businessBankDetails.sortCode : '',
            newAccountNumber: businessBankDetails ? businessBankDetails.newAccountNumber : '',
            accountHolderName: businessBankDetails ? businessBankDetails.accountHolderName : '',
            routingNumber: businessBankDetails ? businessBankDetails.routingNumber : '',
            nameOfBank: businessBankDetails ? businessBankDetails.nameOfBank : '',
            bankAddress1: businessBankDetails ? businessBankDetails.bankAddress1 : '',
            bankAddress2: businessBankDetails ? businessBankDetails.bankAddress2 : '',
            bsb: businessBankDetails ? businessBankDetails.bsb : '',
            transitNumber: businessBankDetails ? businessBankDetails.transitNumber : '',
            financialInstitutionNumber: businessBankDetails ? businessBankDetails.financialInstitutionNumber : ''
        };
    }

    async validateDetails(details) {
        const axios = Axios.create();
        const config = {
            method: 'post',
            url: BANK_VALIDATION_UK_API_ENDPOINT,
            params: {
                Key: BANK_VALIDATION_UK_API_KEY,
                AccountNumbers: details.accountNumber,
                SortCodes: details.sortCode
            }
        };

        return axios(config);
    }
}

const bankTokenisation = async (merchantId) => {
    try {
        const merchant = await merchantRepo.findOne({
            where: {
                id: merchantId
            },
            attributes: ['id', 'legalName', 'primaryOwnerId']
        });
        const ownersDetails = await ownerDetailsRepo.findOne({
            where: {
                id: merchant.primaryOwnerId
            },
            attributes: ['email']
        });
        const updatedBankDetails = await bankDetailsUpdateRequestRepo.findOne({
            where: {
                merchantId: merchantId,
                approvalStatus: UpdateBankDetailsAccountStatus.WAITING_APPROVAL
            }
        });
        const axios = Axios;

        var data = JSON.stringify({
            merchantId: merchantId,
            ownerEmail: ownersDetails.email,
            name: merchant.legalName,
            accountHolderName: updatedBankDetails.accountHolderName,
            bsb: updatedBankDetails.bsb,
            accountNumber: updatedBankDetails.newAccountNumber
        });

        var config = {
            method: 'post',
            url: BANK_TOKENIZATION_API_URL,
            headers: {
                api_key: BANK_TOKENIZATION_API_KEY,
                'Content-Type': 'application/json'
            },
            data: data
        };

        axios(config)
            .then(function (response) {
                console.log(JSON.stringify(response.data));
            })
            .catch(function (error) {
                console.log('The Error', error);
            });
    } catch (error) {
        console.log('error:- ', error);
    }
};
