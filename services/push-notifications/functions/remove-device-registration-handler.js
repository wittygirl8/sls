var { response, middy, userAccessValidatorMiddleware } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
import { PushNotficationService } from '../business-logic/push-notification.service';
import { AwsSnsPushNotficationService } from '../business-logic/aws-sns-push-notification.service';
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

export const removeDeviceRegistration = middy(async (event) => {
    try {
        const body = event.pathParameters;

        const { deviceId } = body;

        if (deviceId) {
            const res = await pushNotficationService.getDeviceEndpoint({ deviceId });
            await awsSnsPushNotficationService.deletePlatformEndpoint(res[0].platformEndpoint);
            const data = await pushNotficationService.deletePlatformEndpointFromDB(res[0].id);
            if (data) return response({ ...successResponse, data: data });
            else return response(errorResponse, 404);
        } else {
            return response(errorResponse, 404);
        }
    } catch (e) {
        console.log({ e });
        return response(errorResponse, 404);
    }
}).use(userAccessValidatorMiddleware());
