const AWS = require('aws-sdk');

AWS.config.update({
    region: process.env.REGION
});

const sns = new AWS.SNS();
export class AwsSnsPushNotficationService {
    async createPlatformEndpoint(platform_arn, device_token, user_data) {
        const response = sns
            .createPlatformEndpoint({
                PlatformApplicationArn: platform_arn,
                Token: device_token,
                CustomUserData: user_data
            })
            .promise();

        return await response.then((r) => r).catch((err) => console.log('Error ', err));
    }

    deletePlatformEndpoint(device_arn) {
        try {
            return new Promise((resolve, reject) => {
                return sns.deleteEndpoint(
                    {
                        EndpointArn: device_arn
                    },
                    (err, deletePlatformEndpointResponse) => {
                        if (err) {
                            console.log({ err: err.stack });
                            reject('something went wrong ', err);
                            return;
                        } else {
                            console.log({ deletePlatformEndpointResponse });
                            resolve(deletePlatformEndpointResponse);
                        }
                    }
                );
            });
        } catch (e) {
            console.log({ e });
            return false;
        }
    }

    async sendPushNotification(device_arn, messageData) {
        return new Promise((result, reject) => {
            try {
                const params = {
                    Attributes: {
                        Enabled: 'true'
                    },
                    EndpointArn: device_arn
                };
                console.log({ messageData });
                return sns.setEndpointAttributes(params, async (err, setEndpointAttributesResponse) => {
                    if (err) {
                        console.log({ err: err.stack });
                        reject({ err });
                        return;
                    } else {
                        console.log({ setEndpointAttributesResponse });

                        let payload = {
                            default: messageData.data
                        };

                        const GCM_DATA = {
                            notification: messageData,
                            data: messageData,
                            content_available: true, //important
                            priority: 'high'
                        };

                        const APNS_DATA = {
                            headers: {
                                'apns-priority': '5'
                            },
                            aps: {
                                alert: messageData.data,
                                sound: 'default',
                                badge: 1
                            }
                        };

                        payload = {
                            ...payload,
                            GCM: JSON.stringify(GCM_DATA),
                            APNS: JSON.stringify(APNS_DATA)
                        };

                        payload = JSON.stringify(payload);

                        return sns.publish(
                            {
                                Message: payload,
                                MessageStructure: 'json',
                                TargetArn: device_arn
                            },
                            (err, sendPushNotificationResponse) => {
                                if (err) {
                                    console.log({ err: err.stack });
                                    reject({ err });
                                } else {
                                    console.log({ sendPushNotificationResponse });
                                    result({ sendPushNotificationResponse });
                                }
                            }
                        );
                    }
                });
            } catch (e) {
                console.log({ e });
                reject({ e });
            }
        });
    }
}
