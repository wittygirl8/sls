import AWS from 'aws-sdk';

export const main = async (event) => {
    console.log('Send data', event.body);

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
        MessageGroupId: 'testGroup',
        MessageBody: event.body,
        QueueUrl: process.env.TEST_QUEUE_URL
    };

    await sqs.sendMessage(params).promise();

    return {};
};
