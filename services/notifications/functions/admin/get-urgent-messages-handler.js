var { connectDB } = process.env.IS_OFFLINE ? require('../../../../layers/models_lib/src') : require('models');
var { response } = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');
var { UrgentMessagesRepo } = require('../../../../libs/repo/urgent-messages.repo');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);
const { Op } = db.Sequelize;

const urgentMessagesRepo = new UrgentMessagesRepo(db);

export const getUrgentMessages = async (event) => {
    try {
        const resellerId = event.pathParameters.resellerId;

        const currentDate = new Date();
        const urgentMessages = await urgentMessagesRepo.findAll({
            where: {
                startDate: { [Op.lte]: currentDate },
                endDate: { [Op.gte]: currentDate },
                resellerId: resellerId
            }
        });

        return response({ urgentMessages });
    } catch (err) {
        console.error(err);
        return response({}, 500);
    }
};
