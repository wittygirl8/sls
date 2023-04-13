'use strict';
const { nanoid } = require('nanoid');

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface
            .createTable('User-Types', {
                id: {
                    allowNull: false,
                    primaryKey: true,
                    type: Sequelize.STRING,
                },
                name: {
                    allowNull: false,
                    type: Sequelize.STRING,
                },
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                },
            })
            .then(() =>
                queryInterface
                    .bulkInsert('User-Types', [
                        {
                            id: nanoid(),
                            name: 'Business',
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        },
                        {
                            id: nanoid(),
                            name: 'Client',
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        },
                        {
                            id: nanoid(),
                            name: 'Merchant',
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        },
                    ])
                    .then(() =>
                        queryInterface.addColumn('Users', 'typeId', {
                            type: Sequelize.STRING,
                            references: {
                                model: 'User-Types',
                                key: 'id',
                            },
                        })
                    )
            );
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('Users', 'typeId').then(() => queryInterface.dropTable('User-Types'));
    },
};
