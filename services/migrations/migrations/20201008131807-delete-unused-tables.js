'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.dropTable('merchant_resellers');

            await queryInterface.removeColumn('merchants', 'business_id');
            await queryInterface.removeColumn('clients', 'business_id');
            await queryInterface.removeColumn('relationships', 'business_id');

            await queryInterface.dropTable('businesses');

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            console.log(err);
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.createTable(
                'merchant_resellers',
                {
                    id: {
                        type: Sequelize.INTEGER,
                        primaryKey: true,
                        autoIncrment: true
                    },
                    merchant_id: {
                        type: Sequelize.INTEGER,
                        onDelete: 'CASCADE',
                        allowNull: false,
                        references: {
                            model: 'merchants',
                            key: 'id'
                        }
                    },
                    reseller_reference: {
                        type: Sequelize.INTEGER,
                        allowNull: false
                    },
                    created_at: {
                        type: Sequelize.DATE,
                        allowNull: false
                    },
                    updated_at: {
                        type: Sequelize.DATE,
                        allowNull: false
                    }
                },
                { transaction: transaction }
            );

            await queryInterface.createTable('businesses', {
                id: {
                    primaryKey: true,
                    type: Sequelize.INTEGER,
                    autoIncrment: true
                },
                name: {
                    type: Sequelize.STRING
                },
                description: {
                    type: Sequelize.STRING
                },
                created_at: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                updated_at: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                deleted_at: {
                    allowNull: true,
                    type: Sequelize.DATE
                }
            });

            await queryInterface.addColumn('merchants', 'business_id', {
                type: Sequelize.DataTypes.INTEGER,
                references: {
                    model: 'businesses',
                    key: 'id'
                }
            });

            await queryInterface.addColumn('relationships', 'business_id', {
                type: Sequelize.DataTypes.INTEGER,
                references: {
                    model: 'businesses',
                    key: 'id'
                }
            });

            await queryInterface.addColumn('clients', 'business_id', {
                type: Sequelize.DataTypes.INTEGER,
                references: {
                    model: 'businesses',
                    key: 'id'
                }
            });

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            console.log(err);
        }
    }
};
