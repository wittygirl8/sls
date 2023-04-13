require('dotenv').config();

var { connectDB } = process.env.IS_OFFLINE ? require('../../../../layers/models_lib/src') : require('models');
var { response, middy, userTypesValidatorMiddleware, models } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { UrgentMessagesRepo } = require('../../../../libs/repo/urgent-messages.repo');
const { UserType } = models;
const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

const urgentMessagesRepo = new UrgentMessagesRepo(db);

export const updateUrgentMessage = middy(async (event) => {
    let transaction;

    try {
        const urgentMessageId = event.pathParameters.urgentMessageId;
        const body = JSON.parse(event.body);

        transaction = await db.sequelize.transaction();
        await urgentMessagesRepo.update(urgentMessageId, body.data, transaction);

        await transaction.commit();
        return response({});
    } catch (err) {
        console.error(err);
        if (transaction) {
            await transaction.rollback();
        }
        return response({}, 500);
    }
}).use(userTypesValidatorMiddleware([UserType.ADMIN]));
