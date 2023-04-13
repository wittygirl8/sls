'use strict';

var { response, getUserId } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../../layers/models_lib/src') : require('models');
const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);
const { Op } = db.Sequelize;

export const createBusiness = async (event) => {
    const { sequelize, Business, Role, Relationship } = db;
    const business = JSON.parse(event.body).business;
    const userId = await getUserId(event);
    business.name = business.name.trim();
    const existBusiness = await Business.findOne({
        where: {
            name: business.name
        }
    });
    if (existBusiness) {
        return response({ error: 'Business name already exists' }, 400);
    }
    const transaction = await sequelize.transaction();
    try {
        var businessEntity = Business.build({
            name: business.name
        });
        await businessEntity.save({ transaction: transaction });
        var userRole = await Role.findOne({
            where: {
                name: 'Owner'
            }
        });
        const countRelationshipWithBusiness = await Relationship.count({
            where: {
                userId,
                businessId: { [Op.not]: null }
            }
        });
        if (countRelationshipWithBusiness > 0) {
            await transaction.rollback();
            return response(
                {
                    error: 'The user already has an assigned business'
                },
                400
            );
        }
        var relationship = Relationship.build({
            userId: userId,
            businessId: businessEntity.id,
            roleId: userRole.id
        });
        await relationship.save({ transaction: transaction });
        await transaction.commit();
        return response({}, 201);
    } catch (err) {
        console.log(err);
        await transaction.rollback();
        return response({ error: 'Internal server error' }, 500);
    }
};
