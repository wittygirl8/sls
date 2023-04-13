'use strict';
const { response, middy, apiTokenAuthorisation } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');

import axios from 'axios';

export const bifrostSendPushNotificationHandler = middy(async (event) => {
    try {
        const payload = JSON.parse(event.body);
        console.log({ payload });
        console.log(
            'PUSH_NOTIFICATION_ENDPOINTS ',
            process.env.PUSH_NOTIFICATION_ENDPOINTS + `/send-push-notification`
        );
        console.log('PUSH_NOTIFICATION_ENDPOINTS_API_KEY ', process.env.PUSH_NOTIFICATION_ENDPOINTS_API_KEY);
        const postData = {
            method: 'POST',
            url: process.env.PUSH_NOTIFICATION_ENDPOINTS + `/send-push-notification`,
            headers: {
                api_token: process.env.PUSH_NOTIFICATION_ENDPOINTS_API_KEY
            },
            data: payload
        };

        const responseData = await axios(postData);

        console.log('response ', responseData);

        if (responseData.status === 200) {
            return response({ status: true, message: 'Notification Sent succesully!', data: {} });
        } else {
            return response({ status: false, message: 'Error', data: {} }, 500);
        }
    } catch (error) {
        console.log('Error ', error);
        return response({ status: false, message: error, data: {} }, 500);
    }
}).use(apiTokenAuthorisation());
