// require('dotenv').config();

var { response } = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');
// var { connectDB } = process.env.IS_OFFLINE ? require('../../../../layers/models_lib/src') : require('models');
// const db = connectDB(
//     process.env.DB_RESOURCE_ARN,
//     process.env.INFRA_STAGE + '_database',
//     '',
//     process.env.SECRET_ARN,
//     process.env.IS_OFFLINE
// );

// since this functions are not in a use returning it directly to avoid any security issues
export const getMerchants = async () => {
    return response({}, 500);

    // try {
    //     const merchants = await db.Merchant.findAll();
    //     return response({ merchants });
    // } catch (err) {
    //     return response({}, 500);
    // }
};
