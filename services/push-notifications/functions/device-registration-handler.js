var { response, middy, userAccessValidatorMiddleware } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
import { AwsSnsPushNotficationService } from '../business-logic/aws-sns-push-notification.service';
import { PushNotficationService } from '../business-logic/push-notification.service';

const pushNotficationService = new PushNotficationService();
const awsSnsPushNotficationService = new AwsSnsPushNotficationService();

const successResponse = {
    status: true,
    message: 'Successful',
    data: {}
};

const errorResponse = {
    status: false,
    message: 'Something went wrong!',
    data: {}
};

// let platform_ARN = 'arn:aws:sns:eu-central-1:813715908525:app/GCM/Omnipay-app-test-notifications';

export const deviceRegistration = middy(async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { deviceId, merchantId, deviceModel, deviceOs, state, merchantNotificationData } = body;
        const isValid = deviceId && merchantId && deviceModel && state && deviceOs;

        console.log({ isValid });
        let platform_ARN = '';

        if (isValid) {
            // check for already existing token and platform endpoint
            const checkData = await pushNotficationService.getDeviceEndpoint({ deviceId });

            console.log({ checkData });
            //checkData is array
            if (checkData.length === 1) {
                //returning since this deviceId already exist in DB
                return response(successResponse);
            }

            if (deviceOs === 'android' || deviceOs === 'Android') {
                platform_ARN = process.env.PLATFORM_ARN_ANDROID; // Android Platform ARN
            } else {
                platform_ARN = process.env.PLATFORM_ARN_IOS; // iOS Platform ARN
            }

            const platformEndpointData = await awsSnsPushNotficationService.createPlatformEndpoint(
                platform_ARN,
                deviceId,
                merchantNotificationData
            );
            const { EndpointArn: platformEndpoint } = platformEndpointData;
            const data = {
                deviceId,
                merchantId,
                deviceModel,
                state,
                platformEndpoint
            };
            //Saving data in DB
            const status = await pushNotficationService.addOrUpdateDeviceToken(data);
            console.log({ status });
            if (status) {
                return response(successResponse);
            } else {
                return response(errorResponse, 404);
            }
        } else {
            return response(errorResponse, 404);
        }
    } catch (e) {
        return response(errorResponse, 404);
    }
}).use(userAccessValidatorMiddleware());
