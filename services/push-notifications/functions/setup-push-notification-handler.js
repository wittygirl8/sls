var { response, middy, userAccessValidatorMiddleware } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
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

export const setUpPushNotification = middy(async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { isEnabled } = body;
        const { merchantId } = event.pathParameters;
        console.log('MerchantId ', merchantId);
        const state = isEnabled ? 'ACTIVE' : 'INACTIVE';
        const updatedData = await pushNotficationService.setPushNotificationEnabled(
            JSON.stringify(isEnabled),
            merchantId
        );
        console.log({ updatedData });
        const checkData = await pushNotficationService.getDeviceEndpoint({ merchantId });
        console.log('CheckData ', checkData.length);
        let device_index_ids = checkData.map((item) => item.dataValues.id);
        console.log({ device_index_ids });
        const status = await pushNotficationService.bulkUpdate({ state }, device_index_ids);
        console.log({ status });
        if (status) {
            return response(successResponse);
        } else {
            return response(errorResponse, 404);
        }
    } catch (e) {
        console.log('error ', e);
        return response(errorResponse, 404);
    }
}).use(userAccessValidatorMiddleware());
