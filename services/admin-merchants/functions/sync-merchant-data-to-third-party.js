var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
var { ThirdPartySyncService } = require('../business-logic/thirdPartySync.service');

const thirdPartySyncService = new ThirdPartySyncService();

export const syncMerchantDataToThirdParty = async (event) => {
    try {
        await thirdPartySyncService.execute(event);

        return response({}, 200);
    } catch (err) {
        console.error(err);
        return response('An error occurred, please contact support or try again', 500);
    }
};
