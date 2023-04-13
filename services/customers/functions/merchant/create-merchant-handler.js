require('dotenv').config();

var { response, getUserId } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../../layers/models_lib/src') : require('models');
const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

export const createMerchant = async (event) => {
    const userId = await getUserId(event);
    const merchant = JSON.parse(event.body).merchant;
    const clientId = event.pathParameters.clientId;

    const transaction = await db.sequelize.transaction();

    const existingMerchant = await db.Merchant.findOne({
        where: {
            name: merchant.name
        }
    });

    if (existingMerchant) {
        return response({ error: 'Merchant name already exists' }, 400);
    }

    try {
        var merchantEntity = await db.Merchant.create(
            {
                clientId: clientId,
                name: merchant.name
            },
            { transaction: transaction }
        );

        var userRole = await db.Role.findOne({
            where: {
                name: 'Owner'
            }
        });

        await db.Relationship.create(
            {
                userId: userId,
                merchantId: merchantEntity.id,
                roleId: userRole.id
            },
            { transaction: transaction }
        );

        await transaction.commit();
        return response({}, 201);
    } catch (err) {
        console.error(err);
        await transaction.rollback();
        return response({}, 500);
    }
};
