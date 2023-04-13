// 'use strict';
// require('dotenv').config();
// global.fetch = require('node-fetch').default;

var { response } = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');
// var { connectDB } = process.env.IS_OFFLINE ? require('../../../../layers/models_lib/src') : require('models');
// const db = connectDB(
//     process.env.DB_RESOURCE_ARN,
//     process.env.INFRA_STAGE + '_database',
//     '',
//     process.env.SECRET_ARN,
//     process.env.IS_OFFLINE
// );

export const getRoleFromRelationship = async () => {
    return response('Internal server error', 500);

    // try {
    //     const body = JSON.parse(event.body);
    //     const { userId, clientId, merchantId } = body.data;

    //     const relationship = await db.Relationship.findOne({
    //         where: {
    //             userId,
    //             clientId,
    //             merchantId
    //         },
    //         include: [
    //             {
    //                 model: db.Role,
    //                 attributes: ['name']
    //             }
    //         ]
    //     });

    //     if (relationship) {
    //         const role = relationship.Role;
    //         return response({ role }, 200);
    //     }

    //     return response({}, 400);
    // } catch (error) {
    //     console.log(error);
    //     return response({}, 500);
    // }
};
