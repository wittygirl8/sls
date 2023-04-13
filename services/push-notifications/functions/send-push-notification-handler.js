var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
import { AwsSnsPushNotficationService } from '../business-logic/aws-sns-push-notification.service';
import { PushNotficationService } from '../business-logic/push-notification.service';
const awsSnsPushNotficationService = new AwsSnsPushNotficationService();
const pushNotficationService = new PushNotficationService();

const successResponse = {
    status: true,
    message: 'Successful',
    data: {}
};
const errorResponse = {
    status: false,
    message: 'Error',
    data: {}
};

export async function sendPushNotification(event) {
    //authorisation using the key
    // eslint-disable-next-line
    if (event.headers.hasOwnProperty('api_key')) {
        const { api_key } = event.headers;
        if (api_key !== process.env.API_KEY_FOR_MATCH) {
            return response(errorResponse, 404);
        }
    } else {
        return response(errorResponse, 404);
    }

    const notificationData = JSON.parse(event.body);

    console.log({ notificationData });

    /* sample notificationData - for reference */
    // const testPayload = {
    //         merchantId,
    //         type: '', //sale, refund
    //         via: '', //PayByQr, PayByLink - Email/SMS
    //         amount:'',
    //         customerName: ''
    // };

    const { type, amount, merchantId } = notificationData;

    if (isNaN(amount) || amount <= 0) {
        return response({ ...errorResponse, message: 'Invalid Amount!' }, 404);
    }

    let refactoredAmount = (amount / 100).toFixed(2);
    let messageData = '';

    if (type === 'sale') {
        messageData = {
            title: 'Payment',
            body: `Payment successful for £${refactoredAmount}.`
        };
    } else {
        return response({ ...errorResponse, message: 'Invalid type!' }, 404);
    }

    //  if (type === 'refund') {
    //     messageData = {
    //         title: 'Refund',
    //         body: `Refund successful for £${refactoredAmount}.`
    //     };
    // }

    console.log({ messageData });

    if (!messageData) {
        return response(errorResponse, 404);
    }

    //For testing in local
    // let merchantId = 2; //for testing in local
    // let messageData = {
    //     title: 'Payment',
    //     message: 'You have received $5'
    // }

    let endpointData = [];

    try {
        //fetching all the platformEndpoints from DB to send Push notifications
        const data = await pushNotficationService.getPlatformEndpoints({ merchantId });

        console.log({ data });

        if (data.length > 0) {
            endpointData = data.map((item) => item.platformEndpoint);

            for (let i = 0; i < endpointData.length; i++) {
                const result = await awsSnsPushNotficationService.sendPushNotification(endpointData[i], messageData);
                console.log('result ', result);
            }

            return response(successResponse);
        } else {
            return response(errorResponse, 404);
        }
    } catch (e) {
        console.log({ e });
        return response(errorResponse, 404);
    }
}
