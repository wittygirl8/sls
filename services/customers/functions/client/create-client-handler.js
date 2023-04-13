require('dotenv').config();

var { response, getUserId } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../../layers/models_lib/src') : require('models');

export const createClient = async (event) => {
    const userId = await getUserId(event);
    const db = connectDB(
        process.env.DB_RESOURCE_ARN,
        process.env.INFRA_STAGE + '_database',
        '',
        process.env.SECRET_ARN,
        process.env.IS_OFFLINE
    );
    const client = JSON.parse(event.body).client;
    const businessId = event.pathParameters.businessId;

    const transaction = await db.sequelize.transaction();

    const existingClient = await db.Client.findOne({
        where: {
            businessId: businessId,
            name: client.name
        }
    });

    if (existingClient) {
        return response({ error: 'Client name already exists' }, 400);
    }

    try {
        var clientEntity = db.Client.build({
            businessId: businessId,
            name: client.name
        });

        await clientEntity.save({ transaction: transaction });

        var userRole = await db.Role.findOne({
            where: {
                name: 'Owner'
            }
        });

        var relationship = db.Relationship.build({
            userId: userId,
            clientId: clientEntity.id,
            roleId: userRole.id
        });
        await relationship.save({ transaction: transaction });

        await transaction.commit();
        return response({}, 201);
    } catch (err) {
        await transaction.rollback();
        return response({}, 500);
    }
};
