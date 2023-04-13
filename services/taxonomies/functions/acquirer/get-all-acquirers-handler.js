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

export const getAcquirers = async () => {
    try {
        const acquirers = await acquirersRepo.findAll({});

        const acquirersDto = acquirers.map((acquirer) => {
            return {
                id: acquirer.id,
                name: acquirer.name
            };
        });

        return response(acquirersDto);
    } catch (err) {
        console.log(err);
        return response({}, 500);
    }
};
