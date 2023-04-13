const { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');

export const obnTestWebhook = async (event) => {
    try {
        console.log('event', event);
        return response({}, 200);
    } catch (error) {
        console.error('error in get merchants', error);
        return response(error, 500);
    }
};
