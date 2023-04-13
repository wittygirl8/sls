var {
    DocumentRepo,
    MerchantRepo,
    ResellerRepo,
    RelationshipRepo,
    UserRepo,
    BankDetailsUpdateRequestRepo
} = require('../../../libs/repo');
var { flakeGenerateDecimal } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');

var {
    sendEmail,
    adminSendNotesEmailTemplate,
    zendeskUpdateBankDetailsEmailTemplate,
    auditLogsPublisher,
    documentHelpers
} = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

const { DocumentStatus } = require('../utils/document-status');
const { MerchantCountries } = require('../utils/MerchantCountries');

const AWS = require('aws-sdk');
const s3Client = new AWS.S3({
    signatureVersion: 'v4'
});

const bucket = process.env.BUCKET_NAME;

const EXPIRE_TIME_SECONDS = 600; //considering worst case, At 50KBPS speed  , for a 30MB attatchment, give 10mins to upload

const { Op } = db.Sequelize;
const documentRepo = new DocumentRepo(db);
const merchantRepo = new MerchantRepo(db);
const resellerRepo = new ResellerRepo(db);
const relationshipRepo = new RelationshipRepo(db);
const userRepo = new UserRepo(db);
const bankDetailsUpdateRequestRepo = new BankDetailsUpdateRequestRepo(db);
//const ADYEN_UPLOAD_DOCUMENT = process.env.ADYEN_UPLOAD_DOCUMENT;

export class DocumentService {
    async preSignedUrlPut(entity, entityId, dto) {
        const documentId = flakeGenerateDecimal();

        const s3Params = {
            Bucket: bucket,
            Key: `${entity}/${entityId}/${documentId.toString()}/${dto.filename}`,
            Expires: EXPIRE_TIME_SECONDS,
            ContentType: dto.fileType
        };

        const presignedUrl = await s3Client.getSignedUrlPromise('putObject', s3Params);
        return { documentId, presignedUrl };
    }

    async preSignedUrlGet(entity, entityId, documentId, dto) {
        const s3Params = {
            Bucket: bucket,
            Key: `${entity}/${entityId}/${documentId}/${dto.filename}`,
            Expires: EXPIRE_TIME_SECONDS
        };

        const presignedUrl = await s3Client.getSignedUrlPromise('getObject', s3Params);
        return { documentId, presignedUrl };
    }

    async removeDocument(entity, entityId, documentId, dto, event, userId) {
        let transaction = await db.sequelize.transaction();
        try {
            let entityIdColumn;
            if (entity === 'merchant') {
                entityIdColumn = 'merchantId';
            }
            const document = await documentRepo.findOne({
                where: {
                    id: documentId,
                    [entityIdColumn]: entityId,
                    filename: dto.filename
                }
            });
            if (!document) {
                throw new Error('NOT_FOUND');
            }
            const prevDoc = { ...JSON.parse(JSON.stringify(document)) };

            const updatedDocument = await documentRepo.update(
                document,
                {
                    status: DocumentStatus.DELETED
                },
                transaction
            );
            const docUpdateDto = {
                beforeUpdate: prevDoc,
                afterUpdate: { ...JSON.parse(JSON.stringify(updatedDocument)) },
                tableName: 'documents'
            };
            const auditLogData = [docUpdateDto];
            const auditLogDto = {
                data: {
                    auditLogData,
                    userId: userId,
                    merchantId: entityId,
                    lambadaName: 'RemoveDocument',
                    identity: event?.requestContext?.identity
                },
                queueUrl: process.env.AUDIT_LOGS_QUEUE_URL
            };

            await auditLogsPublisher(auditLogDto);
            const s3Params = {
                Bucket: bucket,
                Key: `${entity}/${entityId}/${documentId}/${dto.filename}`
            };

            await s3Client.deleteObject(s3Params).promise();
            await transaction.commit();
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            throw error;
        }
    }

    async removeBucketDocument(entity, entityId, documentId, dto) {
        const s3Params = {
            Bucket: bucket,
            Key: `${entity}/${entityId}/${documentId}/${dto.filename}`
        };

        await s3Client.deleteObject(s3Params).promise();
    }

    async findAll(entity, entityId, flag) {
        let entityIdColumn;
        if (entity === 'merchant') {
            entityIdColumn = 'merchantId';
        }

        const where = {
            [entityIdColumn]: entityId,
            status: { [Op.not]: DocumentStatus.DELETED }
        };
        if (flag) {
            where.flag = flag;
        }

        return await documentRepo.findAll({
            where: where,
            include: [
                {
                    model: db.DocumentType,
                    attributes: ['name']
                }
            ],
            order: [['created_at', 'DESC']]
        });
    }

    async saveObject(entity, entityId, documentId, dto, event, userId) {
        let transaction;
        //console.log('Starting transaction');

        try {
            let entityIdColumn;
            if (entity === 'merchant') {
                entityIdColumn = 'merchantId';
            }

            const documentDto = {
                [entityIdColumn]: entityId,
                filename: dto.filename,
                size: dto.size,
                id: documentId,
                flag: dto.flag,
                documentTypeId: dto.docTypeId,
                status: DocumentStatus.NEED_APPROVAL
            };

            transaction = await db.sequelize.transaction();
            const docUpdateDto = await documentHelpers.createNewDocument(db, documentDto, transaction);
            const auditLogData = [docUpdateDto];

            const auditLogDto = {
                data: {
                    auditLogData,
                    userId: userId,
                    merchantId: entityId,
                    lambadaName: 'UploadDocument',
                    identity: event?.requestContext?.identity
                },
                queueUrl: process.env.AUDIT_LOGS_QUEUE_URL
            };

            await auditLogsPublisher(auditLogDto);
            await transaction.commit();
            //console.log('Committing transaction');

            // if (dto.flag === 'BANK_VERIFY') {
            //     const merchant = await merchantRepo.findOne({
            //         where: { id: entityId },
            //         attributes: ['businessBankDetailsId']
            //     });

            //     const bankDetails = await businessBankDetailsRepo.findOne({
            //         where: {
            //             id: merchant.businessBankDetailsId
            //         },
            //         attributes: ['adyenBankUUID']
            //     });

            //     if (bankDetails?.adyenBankUUID) {
            //         const payLoad = {
            //             bankAccountUUID: bankDetails.adyenBankUUID
            //         };

            //         const axios = Axios.create();

            //         var config = {
            //             method: 'post',
            //             url: `${ADYEN_UPLOAD_DOCUMENT}/${entityId}/${documentId}`,
            //             data: JSON.stringify(payLoad),
            //             headers: {
            //                 Authorization: event.headers['Authorization'],
            //                 'Content-Type': 'application/json'
            //             }
            //         };

            //         await axios(config);
            //     }
            // }

            return null;
        } catch (error) {
            if (transaction) {
                console.log('we are here');
                await transaction.rollback();
            }
            //Remove S3 object
            const s3Params = {
                Bucket: bucket,
                Key: `${entity}/${entityId}/${documentId}/${dto.filename}`
            };

            await s3Client.deleteObject(s3Params).promise();
            console.log('error', error);
            throw error;
        }
    }

    async notifyAdminAboutDocumentUploading(merchantId, resellerId, isBankDetailsUpdated) {
        const merchant = await merchantRepo.findOne({ where: { id: merchantId } });
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

        if (isBankDetailsUpdated) {
            const businessBankDetails = await bankDetailsUpdateRequestRepo.findOne({
                where: {
                    merchantId: merchantId,
                    approvalStatus: 'WAITING_APPROVAL'
                }
            });

            const ukMerchant = merchant.country === MerchantCountries.UNITED_KINGDOM;
            const ausMerchant = merchant.country === MerchantCountries.AUSTRALIA;
            const usaMerchant = merchant.country === MerchantCountries.UNITED_STATES;

            const emailTemplate = zendeskUpdateBankDetailsEmailTemplate(
                merchantId,
                merchant.name,
                merchant.legalName,
                businessBankDetails?.sortCode,
                businessBankDetails?.newAccountNumber,
                businessBankDetails?.accountHolderName,
                businessBankDetails?.bsb,
                businessBankDetails?.routingNumber,
                resellerBrandingObj,
                ukMerchant,
                ausMerchant,
                usaMerchant
            );

            await sendEmail({
                email: resellerBrandingObj.email,
                subject: `Bank Account Details Update for: - ${merchant.name} (${merchant.country})`,
                message: emailTemplate,
                resellerBrandingObj
            });
        } else {
            const emailTemplate = `<div>
                The merchant <span style="font-weight: bold;">${merchant.name}</span>
                <span style="font-weight: bold;">(id: ${merchant.id})</span> uploaded documents for Bank Account and Account verification.
            </div>`;

            await sendEmail({
                email: resellerBrandingObj.email,
                subject: 'Merchant Bank and Account document uploading',
                message: emailTemplate,
                resellerBrandingObj
            });
        }
    }

    async sendEmailToCostumer(merchantId, resellerId, notes) {
        const merchant = await merchantRepo.findOne({ where: { id: merchantId } });
        const reseller = await resellerRepo.findOne({ where: { id: resellerId } });
        const relationship = await relationshipRepo.findOne({ where: { merchantId: merchantId } });
        const user = await userRepo.findByPk(relationship.userId);

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

        const reviewAndRemedialActionDataObj = {
            ownerName: `${user.firstName} ${user.lastName}`,
            merchantName: merchant.name,
            notes: notes
        };

        const emailTemplate = adminSendNotesEmailTemplate({
            reviewAndRemedialActionDataObj,
            resellerBrandingObj
        });

        await sendEmail({
            email: user.email,
            subject: 'Customer review and remedial action needed.',
            message: emailTemplate,
            resellerBrandingObj
        });
    }

    async updateDocumentStatus(merchantId, documentId, body, event, userId) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();

            const { flag, documentStatus, documentTypeId } = body;

            let documentTypeIds = [];
            if (flag === 'BANK_VERIFY') {
                documentTypeIds = [1, 8];
            } else if (flag === 'ACCOUNT_VERIFY') {
                documentTypeIds = [documentTypeId];
            }

            if (documentStatus === DocumentStatus.ACTIVE) {
                const existingDocuments = await documentRepo.findAll({
                    where: {
                        merchantId: merchantId,
                        status: { [Op.in]: [DocumentStatus.ACTIVE, DocumentStatus.NEED_APPROVAL] },
                        documentTypeId: { [Op.in]: documentTypeIds }
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
            }

            const uploadedNewDocument = await documentRepo.findOne({ where: { id: documentId } });

            const exitingDoc = { ...JSON.parse(JSON.stringify(uploadedNewDocument)) };
            const updatedDoc = await documentRepo.update(
                uploadedNewDocument,
                {
                    status: documentStatus
                },
                transaction
            );

            const docUpdateDto = {
                beforeUpdate: exitingDoc,
                afterUpdate: { ...JSON.parse(JSON.stringify(updatedDoc)) },
                tableName: 'documents'
            };
            const auditLogData = [docUpdateDto];
            const auditLogDto = {
                data: {
                    auditLogData,
                    userId: userId,
                    merchantId: merchantId,
                    lambadaName: 'UpdateDocumentStatus',
                    identity: event.requestContext.identity
                },
                queueUrl: process.env.AUDIT_LOGS_QUEUE_URL
            };
            await auditLogsPublisher(auditLogDto);

            await transaction.commit();
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            throw error;
        }
    }

    async updateDocumentType(documentId, body, event, userId) {
        let transaction;
        try {
            const { documentTypeId } = body;
            transaction = await db.sequelize.transaction();
            const uploadedNewDocument = await documentRepo.findOne({ where: { id: documentId } });

            const exitingDoc = { ...JSON.parse(JSON.stringify(uploadedNewDocument)) };
            const updatedDoc = await documentRepo.update(
                uploadedNewDocument,
                {
                    documentTypeId: documentTypeId
                },
                transaction
            );
            const updateDoc = { ...JSON.parse(JSON.stringify(updatedDoc)) };
            const docUpdateDto = {
                beforeUpdate: exitingDoc,
                afterUpdate: updateDoc,
                tableName: 'documents'
            };
            const auditLogData = [docUpdateDto];
            const auditLogDto = {
                data: {
                    auditLogData,
                    userId: userId,
                    merchantId: uploadedNewDocument.merchantId,
                    lambadaName: 'UpdateDocumentType',
                    identity: event.requestContext.identity
                },
                queueUrl: process.env.AUDIT_LOGS_QUEUE_URL
            };
            await auditLogsPublisher(auditLogDto);
            await transaction.commit();
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            throw error;
        }
    }
}
