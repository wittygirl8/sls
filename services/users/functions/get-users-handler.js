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

export const getUsers = async (event) => {
    try {
        const { User, Relationship, Business, Client, Merchant, Role } = db;
        const { Op } = db.Sequelize;

        const userId = await getUserId(event);

        const businessesIds = new Set();
        const merchantsIds = new Set();
        const clientsIds = new Set();

        const relationships = await Relationship.findAll({
            where: {
                userId: userId
            },
            include: [
                {
                    model: Role,
                    where: {
                        name: {
                            [Op.or]: ['Admin', 'Manager', 'Owner']
                        }
                    },
                    attributes: ['name']
                },
                {
                    model: Business,
                    attributes: [[db.sequelize.col('name'), 'name']],
                    include: [
                        {
                            model: Client,
                            attributes: [[db.sequelize.col('name'), 'name']],
                            include: [
                                {
                                    model: Merchant,
                                    attributes: [[db.sequelize.col('name'), 'name']]
                                }
                            ]
                        }
                    ]
                },
                {
                    model: Client,
                    attributes: [[db.sequelize.col('name'), 'name']],
                    include: [
                        {
                            model: Merchant,
                            attributes: [[db.sequelize.col('name'), 'name']]
                        }
                    ]
                },
                {
                    model: Merchant,
                    attributes: [[db.sequelize.col('name'), 'name']]
                }
            ]
        });

        relationships
            .filter((r) => r.businessId)
            .forEach((b) => {
                businessesIds.add(b.businessId);
                b.Business.Clients.forEach((c) => {
                    clientsIds.add(c.id);
                    c.Merchants.forEach((m) => merchantsIds.add(m.id));
                });
            });

        relationships
            .filter((r) => r.clientId)
            .forEach((c) => {
                clientsIds.add(c.clientId);
                c.Client.Merchants.forEach((m) => merchantsIds.add(m.id));
            });

        relationships.filter((r) => r.merchantId).forEach((m) => merchantsIds.add(m.merchantId));

        var usersIds = await Relationship.findAll({
            where: db.Sequelize.or(
                { businessId: [...businessesIds] },
                { clientId: [...clientsIds] },
                { merchantId: [...merchantsIds] }
            ),
            group: ['userId']
        }).map((r) => r.userId);

        const users = await User.findAll({
            where: {
                id: usersIds
            },
            include: [
                {
                    model: Relationship,
                    include: [
                        {
                            model: Business,
                            attributes: [[db.sequelize.col('name'), 'name']]
                        },
                        {
                            model: Client,
                            attributes: [[db.sequelize.col('name'), 'name']]
                        },
                        {
                            model: Merchant,
                            attributes: [[db.sequelize.col('name'), 'name']]
                        },
                        {
                            model: Role,
                            attributes: [[db.sequelize.col('name'), 'name']]
                        }
                    ]
                }
            ]
        });
        return response({ users });
    } catch (error) {
        console.log(error);
        return response({ error }, 500);
    }
};
