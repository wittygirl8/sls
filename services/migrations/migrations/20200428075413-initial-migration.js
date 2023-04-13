'use strict';
const { nanoid } = require('nanoid');

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface
            .createTable('Users', {
                id: {
                    allowNull: false,
                    primaryKey: true,
                    type: Sequelize.STRING,
                },
                firstName: {
                    type: Sequelize.STRING,
                },
                lastName: {
                    type: Sequelize.STRING,
                },
                email: {
                    allowNull: false,
                    type: Sequelize.STRING,
                },
                pictureUrl: {
                    type: Sequelize.STRING,
                },
                isDisable: {
                    type: Sequelize.BOOLEAN,
                },
                isDeleted: {
                    type: Sequelize.BOOLEAN,
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
                queryInterface.createTable('IdentityProviderMyPayRelations', {
                    id: {
                        allowNull: false,
                        primaryKey: true,
                        type: Sequelize.STRING,
                    },
                    userId: {
                        type: Sequelize.STRING,
                        onDelete: 'CASCADE',
                        allowNull: false,
                        references: {
                            model: 'Users',
                            key: 'id',
                        },
                    },
                    providerId: Sequelize.STRING,
                    providerName: Sequelize.STRING,
                    isActive: Sequelize.BOOLEAN,
                    createdAt: {
                        allowNull: false,
                        type: Sequelize.DATE,
                    },
                    updatedAt: {
                        allowNull: false,
                        type: Sequelize.DATE,
                    },
                })
            )
            .then(() =>
                queryInterface.createTable('Roles', {
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
            )
            .then(() =>
                queryInterface.createTable('Businesses', {
                    id: {
                        allowNull: false,
                        primaryKey: true,
                        type: Sequelize.STRING,
                    },
                    name: {
                        type: Sequelize.STRING,
                    },
                    description: {
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
            )
            .then(() =>
                queryInterface.createTable('Clients', {
                    id: {
                        allowNull: false,
                        primaryKey: true,
                        type: Sequelize.STRING,
                    },
                    name: {
                        type: Sequelize.STRING,
                    },
                    description: {
                        type: Sequelize.STRING,
                    },
                    businessId: {
                        type: Sequelize.STRING,
                        onDelete: 'CASCADE',
                        references: {
                            model: 'Businesses',
                            key: 'id',
                        },
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
            )
            .then(() =>
                queryInterface.createTable('Merchants', {
                    id: {
                        allowNull: false,
                        primaryKey: true,
                        type: Sequelize.STRING,
                    },
                    name: {
                        type: Sequelize.STRING,
                    },
                    description: {
                        type: Sequelize.STRING,
                    },
                    clientId: {
                        type: Sequelize.STRING,
                        onDelete: 'CASCADE',
                        references: {
                            model: 'Clients',
                            key: 'id',
                        },
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
            )
            .then(() =>
                queryInterface.createTable('Relationships', {
                    id: {
                        allowNull: false,
                        primaryKey: true,
                        type: Sequelize.STRING,
                    },
                    userId: {
                        type: Sequelize.STRING,
                        allowNull: false,
                        references: {
                            model: 'Users',
                            key: 'id',
                        },
                    },
                    businessId: {
                        type: Sequelize.STRING,
                        onDelete: 'CASCADE',
                        references: {
                            model: 'Businesses',
                            key: 'id',
                        },
                    },
                    clientId: {
                        type: Sequelize.STRING,
                        onDelete: 'CASCADE',
                        references: {
                            model: 'Clients',
                            key: 'id',
                        },
                    },
                    merchantId: {
                        type: Sequelize.STRING,
                        onDelete: 'CASCADE',
                        references: {
                            model: 'Merchants',
                            key: 'id',
                        },
                    },
                    roleId: {
                        type: Sequelize.STRING,
                        allowNull: false,
                        references: {
                            model: 'Roles',
                            key: 'id',
                        },
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
            )
            .then(() =>
                queryInterface.bulkInsert('Roles', [
                    {
                        id: nanoid(),
                        name: 'Admin',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    {
                        id: nanoid(),
                        name: 'User',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                ])
            );
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface
            .dropTable('Relationships')
            .then(() => queryInterface.dropTable('IdentityProviderMyPayRelations'))
            .then(() => queryInterface.dropTable('Users'))
            .then(() => queryInterface.dropTable('Roles'))
            .then(() => queryInterface.dropTable('Merchants'))
            .then(() => queryInterface.dropTable('Clients'))
            .then(() => queryInterface.dropTable('Businesses'));
    },
};
