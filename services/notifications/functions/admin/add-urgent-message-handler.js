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

export const addUrgentMessage = middy(async (event) => {
    let transaction;

    try {
        transaction = await db.sequelize.transaction();
        const resellerId = event.pathParameters.resellerId;
        const body = JSON.parse(event.body);
        body.data.resellerId = resellerId;
        const merchantIds = JSON.stringify(body.data.merchantIds);

        urgentMessagesRepo.clean();

        const dto = {
            resellerId: body.data.resellerId,
            subject: body.data.subject,
            message: body.data.message,
            startDate: body.data.startDate,
            endDate: body.data.endDate,
            merchantIds: merchantIds
        };
        await urgentMessagesRepo.save(dto, transaction);
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
