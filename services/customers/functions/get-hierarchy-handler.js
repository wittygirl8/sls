'use strict';

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
const { Op } = db.Sequelize;

export const getHierarchy = async (event) => {
    const userId = await getUserId(event);

    try {
        const clientsList = [];
        const merchantsList = [];

        const { Business, Client, Merchant, Role } = db;

        const businesses = await db.Relationship.findAll({
            where: {
                businessId: { [Op.not]: null },
                userId: userId
            },
            include: [
                {
                    model: Business,
                    attributes: [
                        [db.sequelize.col('name'), 'name'],
                        [db.sequelize.col('description'), 'description']
                    ],
                    include: [
                        {
                            model: Client,
                            attributes: [
                                [db.sequelize.col('name'), 'name'],
                                [db.sequelize.col('description'), 'description'],
                                [db.sequelize.col('Business.Clients.business_id'), 'businessId']
                            ],
                            include: {
                                model: Merchant,
                                attributes: [
                                    [db.sequelize.col('Business.Clients.Merchants.id'), 'id'],
                                    [db.sequelize.col('name'), 'name'],
                                    [db.sequelize.col('description'), 'description'],
                                    [db.sequelize.col('Business.Clients.Merchants.business_id'), 'businessId'],
                                    [db.sequelize.col('Business.Clients.Merchants.client_id'), 'clientId']
                                ]
                            }
                        }
                    ]
                },
                {
                    model: Role,
                    attributes: ['name']
                }
            ],
            order: [
                [db.Business, 'created_at', 'asc'],
                [db.Business, db.Client, 'created_at', 'asc'],
                [db.Business, db.Client, db.Merchant, 'created_at', 'asc']
            ]
        }).map((b) => {
            let businessObject = b.Business.get({ plain: true });
            businessObject.role = b.Role.name;
            return businessObject;
        });

        businesses.forEach((b) => {
            b.Clients.forEach((c) => {
                clientsList.push(c.id);
                c.role = b.role;

                c.Merchants.forEach((m) => {
                    merchantsList.push(m.id);
                    m.role = b.role;
                });
            });
        });

        const clients = await db.Relationship.findAll({
            where: { clientId: { [Op.not]: null }, userId: userId },
            include: [
                {
                    model: Client,
                    attributes: [
                        [db.sequelize.col('Client.id'), 'id'],
                        [db.sequelize.col('name'), 'name'],
                        [db.sequelize.col('description'), 'description'],
                        [db.sequelize.col('Client.business_id'), 'businessId']
                    ],
                    include: [
                        {
                            model: Merchant,
                            attributes: [
                                [db.sequelize.col('Client.Merchants.id'), 'id'],
                                [db.sequelize.col('name'), 'name'],
                                [db.sequelize.col('description'), 'description'],
                                [db.sequelize.col('Client.Merchants.business_id'), 'businessId']
                            ]
                        }
                    ]
                },
                {
                    model: Role,
                    attributes: ['name']
                }
            ],
            order: [
                [db.Client, 'created_at', 'asc'],
                [db.Client, db.Merchant, 'created_at', 'asc']
            ]
        })
            .filter((f) => !clientsList.includes(f.Client.id))
            .map((c) => {
                let clientObject = c.Client.get({ plain: true });
                clientObject.role = c.Role.name;
                return clientObject;
            });

        clients.forEach((c) => {
            c.Merchants.forEach((m) => {
                merchantsList.push(m.id);
                m.role = c.role;
            });
        });

        const merchants = await db.Relationship.findAll({
            where: { merchantId: { [Op.not]: null }, userId: userId },
            include: [
                {
                    model: Merchant,
                    attributes: [
                        [db.sequelize.col('Merchant.id'), 'id'],
                        [db.sequelize.col('name'), 'name'],
                        [db.sequelize.col('description'), 'description'],
                        [db.sequelize.col('Merchant.business_id'), 'businessId'],
                        [db.sequelize.col('Merchant.client_id'), 'clientId']
                    ]
                },
                {
                    model: Role,
                    attributes: ['name']
                }
            ],
            order: [[db.Merchant, 'created_at', 'asc']]
        })
            .filter((f) => !merchantsList.includes(f.Merchant.id))
            .map((m) => {
                let merchantObject = m.Merchant.get({ plain: true });
                merchantObject.role = m.Role.name;
                return merchantObject;
            });

        return response({
            Businesses: businesses,
            Clients: clients,
            Merchants: merchants
        });
    } catch (err) {
        console.error(err); //loging
        return response('Server Error', 500);
    }
};
