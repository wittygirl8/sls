var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
var { NotifyApplicationFailuresService } = require('../business-logic/notify-application-failures.service');

var notifyApplicationFailuresService = new NotifyApplicationFailuresService();

export const notifyApplicationFailures = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { resellerId, type, details } = body;
        await notifyApplicationFailuresService.notify(resellerId, type, details);

        return response({});
    } catch (error) {
        console.log(error);
        return response('Internal server error', 500);
    }
};
