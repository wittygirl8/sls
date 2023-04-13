import AWS from 'aws-sdk';

export const main = async (event) => {
    console.log('data', event.body);

    let snsOpts = {};

    if (process.env.IS_OFFLINE) {
        snsOpts.endpoint = 'http://127.0.0.1:4005';
    }

    const sns = new AWS.SNS(snsOpts);

    let messageData = {
        Subject: `CustomMessage`,
        Message: `Hello from Publisher`,
        MessageStructure: 'string',
        TopicArn: process.env.TEST_TOPIC_ARN
    };

    await sns.publish(messageData).promise();

    return {};
};
