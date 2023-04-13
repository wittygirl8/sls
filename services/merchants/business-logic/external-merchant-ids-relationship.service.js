var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const { ExternalMerchantIdsRepo } = require('../../../libs/repo/external-merchant-ids-relationship.repo');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

const externalMerchantIdsRepo = new ExternalMerchantIdsRepo(db);

export class ExternalMerchantIdsService {
    async findByMerchantId(id) {
        return await externalMerchantIdsRepo.findByMerchantId(id);
    }
}
