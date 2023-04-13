var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
let { BusinessRepo, RelationshipRepo, UserRoleRepo } = require('../../../libs/repo');
import { FailedOperation, SuccessOperation } from './service.response.helper';
const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);
const businessRepo = new BusinessRepo(db);
const relationshipRepoRepo = new RelationshipRepo(db);
const userRoleRepo = new UserRoleRepo(db);

const { Op } = db.Sequelize;

export class BusinessService {
    /**
     *
     * @param {String} businessName
     * @description Check if Business name exist in DB
     */
    async checkBusinessName(businessName) {
        try {
            const existBusiness = await businessRepo.findOne({
                where: {
                    name: businessName
                }
            });

            if (existBusiness) {
                return { isBusinessNameExist: true };
            } else {
                return { isBusinessNameExist: false };
            }
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    /**
     *
     * @param {String} userId
     * @param {{name: string}} businessData
     * @description Create new business
     */
    async createBusiness(userId, businessData) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();

            const businessDto = {
                name: businessData.name
            };

            const existBusiness = await businessRepo.findOne({
                where: {
                    name: businessDto.name
                }
            });

            if (existBusiness) {
                throw Error('Business name already exists');
            }

            const businessEntity = await businessRepo.save(businessDto, transaction);

            const countRelationshipWithBusiness = await relationshipRepoRepo.count({
                where: {
                    userId,
                    businessId: { [Op.not]: null }
                }
            });

            if (countRelationshipWithBusiness > 0) {
                await transaction.rollback();
                return {
                    operationStatus: false,
                    data: {
                        error: 'The user already has an assigned business'
                    }
                };
            }

            var userRole = await userRoleRepo.findOne({
                where: {
                    name: 'Owner'
                }
            });

            let relationshipDto = {
                userId: userId,
                businessId: businessEntity.id,
                reoleId: userRole.id
            };

            await relationshipRepoRepo.save(relationshipDto, transaction);

            await transaction.commit();

            return SuccessOperation(null);
        } catch (err) {
            transaction.rollback();
            console.error(err);
            throw err;
        }
    }

    /**
     *
     * @param {String} businessId
     * @description Delete busines entity by Id
     */
    async deleteBusiness(businessId) {
        let transaction;

        try {
            transaction = await db.sequelize.transaction();
            await businessRepo.delete(businessId, transaction);
            await transaction.commit();
            return SuccessOperation(null);
        } catch (err) {
            await transaction.rollback();
            console.error(err);
            throw err;
        }
    }
    /**
     *
     * @param {String} businessId
     * Get business by Id
     */
    async getBusiness(businessId) {
        try {
            const business = businessRepo.findByPk(businessId);

            if (business) {
                return SuccessOperation(business);
            } else {
                return FailedOperation({ error: 'Entity not found' });
            }
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async getBusinesses() {
        try {
            const businesses = await businessRepo.findAll({
                include: [
                    {
                        model: db.Client,
                        include: [
                            {
                                model: db.Merchant
                            }
                        ]
                    }
                ]
            });

            return SuccessOperation(businesses);
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async updateBusiness(businessId, businessData) {
        let transaction;

        try {
            transaction = await db.sequelize.transaction();

            await businessRepo.update(businessId, businessData, transaction);
            await transaction.commit();

            return SuccessOperation(null);
        } catch (err) {
            await transaction.rollback();
            console.log(err);
            throw err;
        }
    }
}
