// 'use strict';

var { response } = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');
// var { connectDB } = process.env.IS_OFFLINE ? require('../../../../layers/models_lib/src') : require('models');
// const db = connectDB(
//     process.env.DB_RESOURCE_ARN,
//     process.env.INFRA_STAGE + '_database',
//     '',
//     process.env.SECRET_ARN,
//     process.env.IS_OFFLINE
// );

export const deleteRelationship = async () => {
    return response('Internal server error', 500);

    // const { sequelize, Relationship } = db;
    // const id = event.pathParameters.id;

    // if (!id) {
    //     return response({ errorMessage: 'Invalid request' }, 400);
    // }

    // var transaction = await sequelize.transaction();

    // try {
    //     var relationship = await Relationship.findByPk(id);
    //     if (relationship) {
    //         await relationship.destroy({ transaction: transaction });
    //         await transaction.commit();
    //         return response({}, 200);
    //     } else {
    //         return response({ errorMessage: 'Relationship not found' }, 404);
    //     }
    // } catch (err) {
    //     await transaction.rollback();
    //     return response('Internal server error', 500);
    // }
};
