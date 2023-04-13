var {
    TermsAndConditionsRepo,
    TermsAndConditionsMapRepo,
    UserRepo,
    MerchantRepo,
    AcquirersRepo
} = require('../../../libs/repo');
var { flakeGenerateDecimal } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');

const { TermsAndConditionEntityMap } = require('../utils/terms-and-conditions-entity');
const { TermsAndConditionStatus } = require('../utils/terms-and-conditions-status');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

const AWS = require('aws-sdk');
const s3Client = new AWS.S3({
    signatureVersion: 'v4'
});
const bucket = process.env.CP_DOCS_BUCKET_NAME;

const EXPIRE_TIME_SECONDS = 600; //considering worst case, At 50KBPS speed  , for a 30MB attatchment, give 10mins to upload

const { Op } = db.Sequelize;
const termsAndConditionsRepo = new TermsAndConditionsRepo(db);
const termsAndConditionsMapRepo = new TermsAndConditionsMapRepo(db);
const userRepo = new UserRepo(db);
const merchantRepo = new MerchantRepo(db);
const acquirerRepo = new AcquirersRepo(db);

const moment = require('moment');

export class TermsAndConditionsService {
    async preSignedUrlPut(entity, entityId, dto) {
        const documentId = flakeGenerateDecimal();

        const s3Params = {
            Bucket: bucket,
            Key: `terms-and-conditions/${entity}/${entityId}/${documentId.toString()}/${dto.filename}`,
            Expires: EXPIRE_TIME_SECONDS,
            ContentType: dto.fileType,
            ACL: 'public-read'
        };

        const presignedUrl = await s3Client.getSignedUrlPromise('putObject', s3Params);
        return { documentId, presignedUrl };
    }

    async preSignedUrlGet(entity, entityId, documentId, dto) {
        const s3Params = {
            Bucket: bucket,
            Key: `terms-and-conditions/${entity}/${entityId}/${documentId}/${dto.filename}`,
            Expires: EXPIRE_TIME_SECONDS
        };

        const presignedUrl = await s3Client.getSignedUrlPromise('getObject', s3Params);
        return { documentId, presignedUrl };
    }

    async findAll(entity, entityId) {
        let entityIdColumn;
        if (entity === TermsAndConditionEntityMap.CANONICAL_RESELLER) {
            entityIdColumn = 'canonicalResellerId';
        } else if (entity === TermsAndConditionEntityMap.RESELLER) {
            entityIdColumn = 'resellerId';
        } else if (
            entity === TermsAndConditionEntityMap.ACQUIRER ||
            entity === TermsAndConditionEntityMap.ACQUIRER_AGREEMENT
        ) {
            entityIdColumn = 'acquirerId';
        }

        const where = {
            [entityIdColumn]: entityId
        };

        return await termsAndConditionsRepo.findAll({
            where: where
        });
    }

    async getSignedTermsAndConditionsInfo(entity, entityId) {
        let activatedAt;
        let signedBy;
        let entityColumn;

        if (entity === TermsAndConditionEntityMap.CANONICAL_RESELLER) {
            entityColumn = 'canonicalResellerId';
        } else {
            entityColumn = 'merchantId';
        }

        const where = {
            [entityColumn]: entityId,
            status: TermsAndConditionStatus.ACTIVE
        };
        const response = await termsAndConditionsMapRepo.findOne({
            where: where
        });
        if (response) {
            const userId = response.signedBy;
            activatedAt = response.activatedAt;
            const userRecord = await userRepo.findOne({
                where: { id: userId }
            });
            signedBy = userRecord.firstName.concat(' ', userRecord.lastName);
        }

        return { activatedAt: activatedAt, signedBy: signedBy };
    }

    async saveTermsAndConditions(entity, entityId, documentId, dto) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
            const activatedDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            const deActivatedDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            const acquirerInfo = await acquirerRepo.findOne({
                where: {
                    id: entityId
                }
            });
            let entityIdColumn;
            if (entity === TermsAndConditionEntityMap.CANONICAL_RESELLER) {
                entityIdColumn = 'canonicalResellerId';
            } else if (entity === TermsAndConditionEntityMap.RESELLER) {
                entityIdColumn = 'resellerId';
            } else if (
                entity === TermsAndConditionEntityMap.ACQUIRER ||
                entity === TermsAndConditionEntityMap.ACQUIRER_AGREEMENT
            ) {
                entityIdColumn = 'acquirerId';
            }
            const isMSADOC = entity === TermsAndConditionEntityMap.ACQUIRER_AGREEMENT;

            const allTermsAndConditions = await termsAndConditionsRepo.findAll({
                where: {
                    [entityIdColumn]: entityId,
                    creator: isMSADOC ? { [Op.ne]: entity } : entity,
                    status: TermsAndConditionStatus.ACTIVE
                }
            });
            let acquirerMSADocIds = [];
            let merchantWhere;
            const acquirerAgreementTermsAndConditons = await termsAndConditionsRepo.findAll({
                where: {
                    creator: TermsAndConditionEntityMap.ACQUIRER_AGREEMENT,
                    status: TermsAndConditionStatus.ACTIVE
                }
            });
            acquirerMSADocIds = acquirerAgreementTermsAndConditons.map((item) => item.id);

            const merchantsWithOldTAndC = await merchantRepo.findAll({
                where: { canonicalResellerId: entityId },
                attributes: ['id']
            });

            merchantWhere = isMSADOC
                ? dto.merchantId
                : { [Op.in]: merchantsWithOldTAndC.map((merchant) => merchant.id) };

            const exisistingDocumentIds = isMSADOC ? { [Op.in]: acquirerMSADocIds } : { [Op.notIn]: acquirerMSADocIds };
            const existingTermsAndConditions = await termsAndConditionsMapRepo.findAll({
                where: {
                    merchantId: merchantWhere,
                    status: { [Op.in]: [TermsAndConditionStatus.ACTIVE, TermsAndConditionStatus.PENDING] },
                    tcId: exisistingDocumentIds
                },
                attributes: ['id']
            });

            if (existingTermsAndConditions.length > 0) {
                const deActivateTermsAncConditionDto = {
                    status: TermsAndConditionStatus.IN_ACTIVE,
                    deactivatedAt: deActivatedDate
                };

                const allActiveIds = [];
                for (let i = 0; i < existingTermsAndConditions.length; i++) {
                    allActiveIds.push(existingTermsAndConditions[i].id);
                }

                const where = {
                    id: {
                        [Op.in]: allActiveIds // this will update all the records with an id from the list
                    }
                };
                await termsAndConditionsMapRepo.updateAll(where, deActivateTermsAncConditionDto, transaction);
            }

            if (allTermsAndConditions) {
                await deactivatePreviousTermsAndConditions(allTermsAndConditions, transaction);
            }

            const termsAndConditionDto = {
                [entityIdColumn]: entityId,
                link: dto.link,
                linkType: dto.linkType,
                id: documentId,
                status: 'active',
                activatedAt: activatedDate,
                creator: entity
            };

            await termsAndConditionsRepo.save(termsAndConditionDto, transaction);
            if (acquirerInfo) {
                const applicableTermsAndConditionDto = {
                    tcId: documentId,
                    merchantId: dto.merchantId,
                    belongsTo: 'merchant'
                };
                await termsAndConditionsMapRepo.save(applicableTermsAndConditionDto, transaction);
            }

            const applicableTermsAndConditionDto = [];

            if (merchantsWithOldTAndC.length > 0) {
                for (let i = 0; i < merchantsWithOldTAndC.length; i++) {
                    const merchantDto = {
                        tcId: documentId,
                        merchantId: merchantsWithOldTAndC[i].id,
                        belongsTo: 'merchant'
                    };
                    applicableTermsAndConditionDto.push(merchantDto);
                }
            }

            await termsAndConditionsMapRepo.bulkCreate(applicableTermsAndConditionDto, transaction);
            await transaction.commit();

            const where = {
                [entityIdColumn]: entityId
            };

            return await termsAndConditionsRepo.findAll({
                where: where
            });
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            //Remove S3 object
            const s3Params = {
                Bucket: bucket,
                Key: `terms-and-conditions/${entity}/${entityId}/${documentId}/${dto.filename}`
            };

            await s3Client.deleteObject(s3Params).promise();
            throw error;
        }
    }
}

const deactivatePreviousTermsAndConditions = async (allTermsAndConditions, transaction) => {
    for (let i = 0; i < allTermsAndConditions.length; i++) {
        const termsAndCondition = allTermsAndConditions[i];
        const deactivateDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        const id = termsAndCondition.id;
        await termsAndConditionsRepo.update(
            id,
            { deactivatedAt: deactivateDate, status: TermsAndConditionStatus.IN_ACTIVE },
            transaction
        );
    }
};
