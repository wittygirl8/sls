var { response } = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');
// var { connectDB } = process.env.IS_OFFLINE ? require('../../../../layers/models_lib/src') : require('models');

// since this functions are not in a use returning it directly to avoid any security issues
export const checkBusinessName = async () => {
    return response('Internal server error', 500);

    // const db = connectDB(
    //     process.env.DB_RESOURCE_ARN,
    //     process.env.INFRA_STAGE + '_database',
    //     '',
    //     process.env.SECRET_ARN,
    //     process.env.IS_OFFLINE
    // );
    // const businessName = JSON.parse(event.body).name;

    // const existBusiness = await db.Business.findOne({
    //     where: {
    //         name: businessName
    //     }
    // });

    // if (existBusiness) {
    //     return response({ isBusinessNameExist: true });
    // } else {
    //     return response({ isBusinessNameExist: false });
    // }
};
