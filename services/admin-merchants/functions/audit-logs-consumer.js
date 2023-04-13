const AWS = require('aws-sdk');
const { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const { AuditLogGroupRepo, AuditLogItemRepo } = require('../../../libs/repo');
const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);
const auditLogGroupRepo = new AuditLogGroupRepo(db);
const auditLogItemRepo = new AuditLogItemRepo(db);

const processAuditLogs = async (params) => {
    let transaction;
    try {
        const { identity, userId, merchantId, lambadaName, auditLogData } = params;
        transaction = await db.sequelize.transaction();
        const auditLogDto = {
            userId: userId,
            merchantId: merchantId,
            ipAddress: identity.sourceIp,
            userAgent: identity.userAgent,
            lambadaFunction: lambadaName
        };

        const auditLogGroup = await auditLogGroupRepo.save(auditLogDto, transaction);

        let auditLogItemData = [];
        for (let i = 0; i < auditLogData.length; i++) {
            const logDto = await processAuditLogItems(auditLogGroup.id, auditLogData[i]);
            auditLogItemData = auditLogItemData.concat(logDto);
        }
        if (auditLogItemData.length !== 0) await auditLogItemRepo.bulkCreate(auditLogItemData, transaction);
        await transaction.commit();
    } catch (error) {
        console.log(error);
        if (transaction) {
            await transaction.rollback();
        }
        throw error;
    }
};

const processAuditLogItems = async (logId, logData) => {
    try {
        let auditLogItemDto = [];
        const { beforeUpdate, afterUpdate, tableName } = logData;
        const updatedFiedlds = difference(beforeUpdate, afterUpdate) || [];
        if (updatedFiedlds.length !== 0) {
            updatedFiedlds.forEach((columnName) => {
                const logItem = {
                    logId: logId,
                    fieldModified: columnName,
                    currentValue: beforeUpdate[columnName],
                    newValue: afterUpdate[columnName],
                    tableName: tableName,
                    primaryKey: beforeUpdate.id
                };
                auditLogItemDto.push(logItem);
            });
        }
        return auditLogItemDto;
    } catch (error) {
        console.log(error);
        return error;
    }
};

const difference = (object, base) => {
    const unusedColumns = ['ownership', 'businessTitle', 'updated_at', 'updatedAt', 'created_at', 'createdAt'];
    return Object.keys(object).filter((k) => {
        return !unusedColumns.includes(k) && object[k] !== base[k];
    });
};

export const main = async (event) => {
    try {
        console.log('Start processing Notification event', event);
        const body = JSON.parse(event.Records[0].body);

        await processAuditLogs(body);

        let options = {};
        if (process.env.IS_OFFLINE) {
            options = {
                apiVersion: '2012-11-05',
                region: 'localhost',
                endpoint: 'http://0.0.0.0:9324',
                sslEnabled: false
            };
        }
        const sqs = new AWS.SQS(options);
        const params = {
            QueueUrl: process.env.AUDIT_LOGS_QUEUE_FIFO_URL,
            ReceiptHandle: event.Records[0].receiptHandle
        };

        await sqs.deleteMessage(params).promise();
    } catch (error) {
        console.log('error', error);
        throw error;
    }
};
