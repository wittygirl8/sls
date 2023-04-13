var { response, flakeGenerateDecimal, hmacAuthentication } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

const TempTransactionsStatus = {
    IN_PROGRESS: 'IN_PROGRESS'
};
export const createSession = async (event) => {
    const { sequelize } = db;
    const payload = JSON.parse(event.body);
    const authorization = event.headers.Authorization;
    var transaction = await sequelize.transaction();
    const requestId = 'reqid_' + flakeGenerateDecimal();
    try {
        //do hmac authentication
        let merchant_id = await hmacAuthentication(
            { authorization, payload },
            { sequelize, security_credentials: db.security_credentials }
        );

        let pushItemResp = await db.items.create({
            data: JSON.stringify(payload.items)
        });

        let pushShopperResp = await db.shoppers.create({
            first_name: payload.shoppers.first_name,
            last_name: payload.shoppers.last_name,
            email: payload.shoppers.email,
            address: payload.shoppers.address
        });

        let metaRef = await db.temp_transactions_meta.create({
            data: JSON.stringify(payload.meta_data)
        });

        let pushTempTransactionResp = await db.temp_transactions.create({
            merchant_id,
            user_order_ref: payload.user_order_ref,
            shopper_id: pushShopperResp.dataValues.id,
            item_id: pushItemResp.dataValues.id,
            meta_id: metaRef.dataValues.id,
            amount: payload.amount,
            currency_code: payload.currency_code,
            status: TempTransactionsStatus.IN_PROGRESS
        });

        await transaction.commit();
        return response({
            requestId,
            message: 'success',
            data: {
                session_id: pushTempTransactionResp.dataValues.id
            }
        });
    } catch (err) {
        await transaction.rollback();
        return response({ error_message: err.message }, 500);
    }
};
