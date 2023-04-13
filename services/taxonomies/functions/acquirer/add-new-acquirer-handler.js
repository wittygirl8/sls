require('dotenv').config();

var { response } = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../../layers/models_lib/src') : require('models');

const { AcquirersRepo } = require('../../../../libs/repo');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

const acquirersRepo = new AcquirersRepo(db);

export const addAcquirer = async (event) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const acquirerData = event.pathParameters.newAcquirerData;
        const acquirerDto = {
            name: acquirerData
        };
        await acquirersRepo.save(acquirerDto, transaction);
        await transaction.commit();
        return response({}, 200);
    } catch (error) {
        console.log(error);
        await transaction.rollback();
        return response({}, 500);
    }
};
