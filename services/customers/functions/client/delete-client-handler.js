require('dotenv').config();

var { response } = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');
// var { connectDB } = process.env.IS_OFFLINE ? require('../../../../layers/models_lib/src') : require('models');

// since this functions are not in a use returning it directly to avoid any security issues
export const deleteClient = async () => {
    return response('Internal server error', 500);

    // const db = connectDB(
    //     process.env.DB_RESOURCE_ARN,
    //     process.env.INFRA_STAGE + '_database',
    //     '',
    //     process.env.SECRET_ARN,
    //     process.env.IS_OFFLINE
    // );
    // const clientId = event.pathParameters.clientId;

    // let transaction;
    // try {
    //     const client = await db.Client.findByPk(clientId);

    //     if (!client) {
    //         return response({ errorMessage: 'Entity not found' }, 404);
    //     }

    //     transaction = await db.sequelize.transaction();

    //     await client.destroy({ transaction: transaction });
    //     await transaction.commit();
    //     return response({});
    // } catch (err) {
    //     if (transaction) {
    //         await transaction.rollback();
    //     }

    //     return response({}, 500);
    // }
};
