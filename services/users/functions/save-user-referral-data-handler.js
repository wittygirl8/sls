require('dotenv').config();

var { response, getUserId } = process.env.IS_OFFLINE
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

export const saveUserReferralDataString = async (event) => {
    let transaction = await db.sequelize.transaction();
    try {
        const userId = await getUserId(event);
        const body = JSON.parse(event.body);
        const { referralDataValue } = body;

        db.ReferralData.create({
            userId: userId,
            referralData: referralDataValue
        });

        await transaction.commit();

        return response({});
    } catch (err) {
        console.log(err);
        if (transaction) {
            await transaction.rollback();
        }
        return response({}, 500);
    }
};
