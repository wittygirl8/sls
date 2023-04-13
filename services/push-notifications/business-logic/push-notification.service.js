var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);
import { PushNotificationDeviceIdsRepo, MerchantRepo } from '../../../libs/repo';
const pushNotificationDeviceIdsRepo = new PushNotificationDeviceIdsRepo(db);
const merchantRepo = new MerchantRepo(db);
const { Op } = db.Sequelize;
export class PushNotficationService {
    async addOrUpdateDeviceToken(data) {
        try {
            let transaction = await db.sequelize.transaction();
            const NotifData = await pushNotificationDeviceIdsRepo.findOne({ where: { deviceId: data.deviceId } });

            if (NotifData) {
                await pushNotificationDeviceIdsRepo.update(data, transaction);
            } else {
                await pushNotificationDeviceIdsRepo.save(data, transaction);
            }
            await transaction.commit();
            return true;
        } catch (e) {
            return false;
        }
    }

    async bulkUpdate(data, ids) {
        try {
            let transaction = await db.sequelize.transaction();
            await pushNotificationDeviceIdsRepo.bulkUpdate(
                data,
                {
                    where: { id: { [Op.in]: ids } }
                },
                transaction
            );
            await transaction.commit();
            return true;
        } catch (e) {
            console.log('Error ', e);
            return false;
        }
    }

    async getDeviceEndpoint(data) {
        const NotifData = await pushNotificationDeviceIdsRepo.findAll({ where: data });
        return NotifData;
    }

    async getPlatformEndpoints(data) {
        const NotifData = await pushNotificationDeviceIdsRepo.findAll({
            where: { ...data, platformEndpoint: { [Op.ne]: null }, state: { [Op.ne]: 'INACTIVE' } }
        });
        return NotifData;
    }

    async deletePlatformEndpointFromDB(id) {
        let transaction = await db.sequelize.transaction();
        await pushNotificationDeviceIdsRepo.delete(id, transaction);
        await transaction.commit();
        return true;
    }

    async setPushNotificationEnabled(status, merchantId) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();

            await merchantRepo.update(
                merchantId,
                {
                    isPushNotificationEnabled: status
                },
                transaction
            );

            await transaction.commit();
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            throw error;
        }
    }
}
