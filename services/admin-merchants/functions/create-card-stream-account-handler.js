const AWS = require('aws-sdk');
const datmanAPIEndpoint = process.env.DATMAN_API_ENDPOINT;
import Axios from 'axios';

var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
var { nanoidKeyGenerator } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');

const { PaymentsConfigurationRepo } = require('../../../libs/repo');
const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);
const paymentsConfigurationRepo = new PaymentsConfigurationRepo(db);

export const createCardStreamAccount = async (event) => {
    const { sequelize } = db;
    let transaction = await sequelize.transaction();
    try {
        console.log('Start processing Notification event', event);
        const body = JSON.parse(event.Records[0].body);
        const { token, csData, terminalId, merchantId } = body;
        const csDto = {
            ...csData,
            testMode: csData.testMode || 'YES',
            threeDSEnabled: csData.threeDSEnabled || 'YES',
            threeDSRequired: csData.threeDSRequired || 'YES'
        };
        const csDetails = await createCSClient(token, csDto);

        const paymentsConfiguration = await paymentsConfigurationRepo.findOne({
            where: { merchantId: merchantId, acquirerBank: csData.acquirerBankName }
        });

        if (paymentsConfiguration) {
            const paymentsConfigurationDto = {
                ...paymentsConfiguration,
                accessKey: nanoidKeyGenerator('ak'),
                secretKey: nanoidKeyGenerator('sk'),
                csCustomerId: csDetails.data.customer_id,
                csMerchantId: csDetails.data.merchant_id
            };
            await paymentsConfigurationRepo.update(paymentsConfiguration.id, paymentsConfigurationDto, transaction);
        } else {
            const paymentsConfigurationDto = {
                merchantId: merchantId,
                acquirerBank: csData.acquirerBankName,
                testMode: csData.testMode,
                threeDSecure: csData.threeDSEnabled,
                processorId: csData.processorId,
                terminalId: terminalId,
                mid: csData.processorMerchantID,
                accessKey: nanoidKeyGenerator('ak'),
                secretKey: nanoidKeyGenerator('sk'),
                csCustomerId: csDetails.data.customer_id,
                csMerchantId: csDetails.data.merchant_id
            };
            await paymentsConfigurationRepo.save(paymentsConfigurationDto, transaction);
        }

        await transaction.commit();
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
            QueueUrl: process.env.CARD_STREAM_ACCOUNT_CREATION_QUEUE_URL,
            ReceiptHandle: event.Records[0].receiptHandle
        };
        await sqs.deleteMessage(params).promise();
    } catch (error) {
        if (transaction) {
            await transaction.rollback();
        }
        throw error;
    }
};

async function createCSClient(token, data) {
    try {
        const axios = Axios.create();
        var base64EncodedId = '!!!MTIzNDU=';

        var config = {
            method: 'post',
            url: `${datmanAPIEndpoint}/portal/onboard`,
            headers: {
                Authorization: token + base64EncodedId,
                'Content-Type': 'application/json'
            },
            data: data
        };

        const csResult = await axios(config);
        return csResult.data;
    } catch (err) {
        console.log(err);
        throw err;
    }
}
