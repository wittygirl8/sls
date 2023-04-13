'use strict';
require('dotenv').config();
global.fetch = require('node-fetch').default;

var { response, getUserId } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

export const assignEntityAndRoleToUser = async (event) => {
    let transaction;

    try {
        const requestUserId = await getUserId(event);
        const body = JSON.parse(event.body);
        const { userId, clientId, merchantId, roleId } = body;

        if (userId === requestUserId) {
            return response({}, 401);
        }

        transaction = await db.sequelize.transaction();
        const relationship = await db.Relationship.findOne({
            where: {
                userId,
                clientId,
                merchantId
            }
        });

        if (relationship) {
            const ownerRole = await db.Role.findOne({
                where: {
                    name: 'Owner'
                }
            });

            if (relationship.roleId === ownerRole.id) {
                return response(
                    {
                        error: 'Cannot change role for Owner.'
                    },
                    400
                );
            } else if (relationship.roleId === roleId) {
                return response(
                    {
                        error: 'The assignment already exists.'
                    },
                    400
                );
            }
            await relationship.update({
                roleId
            });
        } else {
            await db.Relationship.create(
                {
                    userId,
                    clientId,
                    merchantId,
                    roleId
                },
                { transaction: transaction }
            );
        }

        return response({}, 201);
    } catch (error) {
        console.log(error);
        await transaction.rollback();
        return response({ error: 'Internal server error' }, 500);
    }
};
