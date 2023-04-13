var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
import { PushNotficationService } from '../business-logic/push-notification.service';

const pushNotficationService = new PushNotficationService();

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

export async function getDeviceRegistration(event) {
    try {
        const body = event.pathParameters;

        const { merchantId } = body;

        if (merchantId) {
            const data = await pushNotficationService.getDeviceEndpoint({ merchantId });

            if (data) return response({ ...successResponse, data: data });
            else return response(errorResponse, 404);
        } else {
            return response(errorResponse, 404);
        }
    } catch (e) {
        console.log({ e });
        return response(errorResponse, 404);
    }
}
