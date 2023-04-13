import axios from 'axios';
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const { AcquirerAccountConfigurationRepo, DnaTransactionDataRepo } = require('../../../libs/repo');
import moment from 'moment';
const FormData = require('form-data');
const AWS = require('aws-sdk');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);
const acquirerAccountConfigurationRepo = new AcquirerAccountConfigurationRepo(db);
const dnaTransactionDataRepo = new DnaTransactionDataRepo(db);
const { sequelize } = db;
const page = 1;
const size = 5000;
const { Op } = db.Sequelize;

// to test DNA live data
//this needs to be stored in SSM before pushing to prod
const dnaAuthPayload = {
    scope: process.env.DNA_SCOPE,
    client_id: process.env.DNA_CLIENT_ID,
    client_secret: process.env.DNA_CLIENT_SECRET,
    grant_type: process.env.DNA_GRANT_TYPE,
    authUrl: 'https://oauth.dnapayments.com/oauth2/token'
};

const getDNAAuth = async (obj) => {
    try {
        var data = new FormData();
        data.append('scope', obj.scope);
        data.append('grant_type', obj.grant_type);
        data.append('client_secret', obj.client_secret);
        data.append('client_id', obj.client_id);

        var config = {
            method: 'post',
            url: obj.authUrl,
            headers: {
                ...data.getHeaders()
            },
            data: data
        };

        let responseDnaAuth = await axios(config);
        return responseDnaAuth.data;
    } catch (error) {
        console.log('DNA auth error', error);
        throw error;
    }
};

const dnaEcomReport = async (dnaAuthResponse, merchantId, page, size) => {
    let transaction;
    try {
        if (!dnaAuthResponse) throw 'dnaAuthResponse is undefined';

        const dnaAccountConfig = await acquirerAccountConfigurationRepo.findOne({
            where: { merchantId: merchantId, acquirer: 'DNA', lastDnaEcomReportUpdatedDate: { [Op.not]: null } },
            attributes: ['id', 'lastDnaEcomReportUpdatedDate', 'dnaMid']
        });

        if (dnaAccountConfig.length !== 0) {
            transaction = await sequelize.transaction();
            const fromDate = moment(dnaAccountConfig.lastDnaEcomReportUpdatedDate)
                .utc()
                .format('YYYY-MM-DDTHH:mm:ss[Z]');
            const toDate = moment(fromDate).add(4, 'days').endOf('day').format('YYYY-MM-DDTHH:mm:ss[Z]');

            const config = {
                method: 'get',
                url: `${process.env.DNA_REPORTING_API_ENDPOINT}/transactions?from=${fromDate}&to=${toDate}&merchantId=${dnaAccountConfig.dnaMid}&page=${page}&size=${size}`,
                headers: {
                    Authorization: `Bearer ${dnaAuthResponse.access_token}`,
                    'Content-Type': 'application/json'
                }
            };

            let responseDnaReport = await axios(config);

            const existingDNATransactions = await dnaTransactionDataRepo.findAll({
                attributes: ['id', 'transactionId']
            });

            const existingTransactionIds =
                existingDNATransactions.length !== 0 ? existingDNATransactions.map((data) => data.transactionId) : [];

            if (responseDnaReport.data.data.length !== 0) {
                const transactionData = responseDnaReport.data.data
                    .filter((data) => !existingTransactionIds.includes(data.id))
                    .map((data) => {
                        return {
                            merchantId: merchantId,
                            type: data.type,
                            transactionAmount: data.amount * 100,
                            transactionId: data.id,
                            transactionDate: data.processedDate,
                            status: data.status,
                            paymentMethod: data.paymentMethod,
                            cardScheme: data.cardScheme,
                            processedAmount: data.processedAmount,
                            payerName: data.payerName,
                            payerEmail: data.payerEmail,
                            payerPhone: data.payerPhone,
                            description: data.description,
                            transactionType: 'ECOM'
                        };
                    });

                await dnaTransactionDataRepo.bulkCreate(transactionData, transaction);
            }

            var isafter = moment(toDate).isAfter(new Date());

            await acquirerAccountConfigurationRepo.update(
                {
                    lastDnaEcomReportUpdatedDate: isafter ? new Date() : toDate,
                    merchantId: merchantId,
                    acquirer: 'DNA'
                },
                transaction
            );
            await transaction.commit();
        }
    } catch (error) {
        console.log('DNA report error=', error);
        if (transaction) {
            await transaction.rollback();
        }
        return error;
    }
};

const dnaPosReport = async (dnaAuthResponse, merchantId, page, size) => {
    let transaction;
    try {
        if (!dnaAuthResponse) throw 'dnaAuthResponse is undefined';

        const dnaAccountConfig = await acquirerAccountConfigurationRepo.findOne({
            where: { merchantId: merchantId, acquirer: 'DNA', lastDnaPosReportUpdatedDate: { [Op.not]: null } },
            attributes: ['id', 'lastDnaPosReportUpdatedDate', 'dnaMid']
        });
        if (dnaAccountConfig.length !== 0) {
            transaction = await sequelize.transaction();
            const fromDate = moment(dnaAccountConfig.lastDnaPosReportUpdatedDate)
                .utc()
                .format('YYYY-MM-DDTHH:mm:ss[Z]');
            const toDate = moment(fromDate).add(4, 'days').endOf('day').format('YYYY-MM-DDTHH:mm:ss[Z]');

            const config = {
                method: 'get',
                url: `${process.env.DNA_REPORTING_API_ENDPOINT}/pos/transactions?from=${fromDate}&to=${toDate}&merchantId=${dnaAccountConfig.dnaMid}&page=${page}&size=${size}`,
                headers: {
                    Authorization: `Bearer ${dnaAuthResponse.access_token}`,
                    'Content-Type': 'application/json'
                }
            };

            let responseDnaReport = await axios(config);

            const existingDNATransactions = await dnaTransactionDataRepo.findAll({
                attributes: ['id', 'transactionId']
            });

            const existingTransactionIds =
                existingDNATransactions.length !== 0 ? existingDNATransactions.map((data) => data.transactionId) : [];

            if (responseDnaReport.data.data.length !== 0) {
                const transactionData = responseDnaReport.data.data
                    .filter((data) => !existingTransactionIds.includes(data.transactionId))
                    .map((data) => {
                        console.log('transactionType', data.transactionType);
                        return {
                            merchantId: merchantId,
                            transactionId: data.transactionId,
                            transactionDate: data.transactionDate,
                            transactionAmount: data.amount * 100,
                            type: data.transactionType,
                            status: data.status,
                            cardScheme: data.cardScheme,
                            transactionType: 'POS'
                        };
                    });

                await dnaTransactionDataRepo.bulkCreate(transactionData, transaction);
            }

            var isafter = moment(toDate).isAfter(new Date());
            await acquirerAccountConfigurationRepo.update(
                { lastDnaPosReportUpdatedDate: isafter ? new Date() : toDate, merchantId: merchantId, acquirer: 'DNA' },
                transaction
            );
            await transaction.commit();
        }
    } catch (error) {
        console.log('DNA report error=', error);
        if (transaction) {
            await transaction.rollback();
        }
        return error;
    }
};

export const main = async (event) => {
    try {
        console.log('Start processing Notification event', event);
        const body = JSON.parse(event.Records[0].body);

        let dnaAuthResponse = await getDNAAuth(dnaAuthPayload);
        await dnaEcomReport(dnaAuthResponse, body.merchantId, page, size);
        await dnaPosReport(dnaAuthResponse, body.merchantId, page, size);

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
            QueueUrl: process.env.DNA_REPORTING_QUEUE_FIFO_URL,
            ReceiptHandle: event.Records[0].receiptHandle
        };

        await sqs.deleteMessage(params).promise();
    } catch (error) {
        console.log('error', error);
        throw error;
    }
};
