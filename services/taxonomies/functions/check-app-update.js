var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
var { CheckAppUpdateService } = require('../business-logic/check-app-update.service');
const checkAppUpdate = new CheckAppUpdateService();

export const handler = async (event) => {
    try {
        if (event.headers['api_token'] !== process.env.APP_UPDATE_API_KEY) {
            throw 'UNAUTHORISED';
        }
        const os = event.pathParameters.platform;
        let parameters = ['latestVersion', 'isForce', 'lastForceVersion'];
        let responseData = {};

        //Possible parameters
        //1. cp/dev/cp/latestVersion_android
        //2. cp/dev/cp/latestVersion_ios
        //3. cp/dev/cp/isForce_android
        //4. cp/dev/cp/isForce_ios
        //5. cp/dev/cp/lastForceVersion_android
        //6. cp/dev/cp/lastForceVersion_ios

        for (let i = 0; i < parameters.length; i++) {
            let value = await checkAppUpdate.getSsmParameter({
                Name: `/cp/${process.env.INFRA_STAGE}/cp/${parameters[i]}_${os}`
            });
            responseData = { ...responseData, [parameters[i]]: value };
        }

        const successResponse = {
            status: true,
            data: responseData,
            message: ''
        };
        return response(successResponse);
    } catch (err) {
        const failureResponse = {
            status: false,
            data: {},
            message: err
        };
        console.error(err);
        return response(failureResponse, 500);
    }
};
