var { response, flakeGenerateDecimal, validateSaleSession } = process.env.IS_OFFLINE
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

export const validateSession = async (event) => {
    let { sequelize } = db;
    const payload = JSON.parse(event.body);
    const requestId = 'reqid_' + flakeGenerateDecimal();

    try {
        let sessionInfo = await validateSaleSession(
            {
                session_id: payload.session_id
            },
            {
                sequelize,
                temp_transactions: db.temp_transactions
            }
        ); //temp_transactions based on the id

        let shopperInformation = await db.shoppers.findOne({
            where: { id: sessionInfo.shopper_id },
            raw: true
        });

        return response({
            requestId,
            message: 'success',
            data: { ...sessionInfo, email: shopperInformation.email }
        });
    } catch (err) {
        return response(err.message, 500);
    }
};
