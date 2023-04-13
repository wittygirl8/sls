require('dotenv').config();

var { response } = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');
// var { connectDB } = process.env.IS_OFFLINE ? require('../../../../layers/models_lib/src') : require('models');

// since this functions are not in a use returning it directly to avoid any security issues
export const checkClientNameIsUnique = async () => {
    return response('Internal server error', 500);

    // const db = connectDB(
    //     process.env.DB_RESOURCE_ARN,
    //     process.env.INFRA_STAGE + '_database',
    //     '',
    //     process.env.SECRET_ARN,
    //     process.env.IS_OFFLINE
    // );

    // const businessId = event.pathParameters.businessId;
    // const clientName = event.queryStringParameters.clientName;

    // try {
    //     const client = await db.Client.findOne({
    //         where: {
    //             businessId: businessId,
    //             name: clientName
    //         }
    //     });

    //     if (client) {
    //         return response({ isClientNameUnique: false });
    //     } else {
    //         return response({ isClientNameUnique: true });
    //     }
    // } catch (err) {
    //     return response({}, 500);
    // }
};
