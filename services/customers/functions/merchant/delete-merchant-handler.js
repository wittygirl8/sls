require('dotenv').config();

var { response, middy, userAccessValidatorMiddleware } = process.env.IS_OFFLINE
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

export const deleteMerchant = middy(async (event) => {
    const merchantId = event.pathParameters.merchantId;
    let transaction;

    try {
        transaction = await db.sequelize.transaction();

        const merchant = await db.Merchant.findByPk(merchantId);
        if (!merchant) {
            return response({ errorMessage: 'Entity not found' }, 404);
        }

        await merchant.destroy({ transaction: transaction });
        await transaction.commit();

        return response({});
    } catch (err) {
        if (transaction) {
            await transaction.rollback();
        }
        return response({}, 500);
    }
}).use(userAccessValidatorMiddleware());
