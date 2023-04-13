import { AuthOTPRepo, UserRepo } from '../../../libs/repo';
import moment from 'moment';
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    false
);
const { Op } = db.Sequelize;
const authOTPRepo = new AuthOTPRepo(db);
const userRepo = new UserRepo(db);

export class AuthOtpService {
    async save(dto) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
            await authOTPRepo.save(dto, transaction);

            await transaction.commit();
        } catch (err) {
            console.error(err);
            if (transaction) {
                await transaction.rollback();
            }

            throw err;
        }
    }

    async checkExistUser(parameter, viaPhone) {
        try {
            const entityColumn = viaPhone ? 'phoneNumber' : 'email';
            const result = await userRepo.findAll({
                limit: 1,
                where: {
                    [entityColumn]: parameter
                }
            });

            if (result && result.length > 0) {
                return result[0];
            }

            return null;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async otpCheck(parameter, viaPhone) {
        try {
            const entityColumn = viaPhone ? 'phone' : 'email';
            const count = await authOTPRepo.count({
                where: {
                    [entityColumn]: parameter,
                    created_at: { [Op.gte]: moment().subtract(30, 'minutes').format('YYYY-MM-DD HH:mm:ss') }
                }
            });
            return count;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}
