var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
var { QrPaymentUrlsRepo, ResellerRepo } = require('../../../libs/repo');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

const qrPaymentUrlsRepo = new QrPaymentUrlsRepo(db);
const resellerRepo = new ResellerRepo(db);

export class MultipleQrService {
    async getById(uuid) {
        return await qrPaymentUrlsRepo.findOne({
            where: {
                uuid: uuid
            }
        });
    }

    async linkWithMerchant(linkData) {
        let transaction = await db.sequelize.transaction();
        const response = await qrPaymentUrlsRepo.update(linkData.uuid, linkData, transaction);
        await transaction.commit();
        return response;
    }

    async getResellerDetails(id) {
        return await resellerRepo.findOne({
            where: {
                id: id
            }
        });
    }
}
