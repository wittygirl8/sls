var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const { BusinessDescriptionRepo } = require('../../../libs/repo/business-description.repo');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

const businessDescriptionRepo = new BusinessDescriptionRepo(db);

export class BusinessDescriptionService {
    async findAll() {
        return await businessDescriptionRepo.findAll();
    }
}
