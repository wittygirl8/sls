'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.createTable(
                'internal_transfers',
                {
                    id: {
                        type: Sequelize.BIGINT,
                        primaryKey: true
                    },
                    amount: {
                        type: Sequelize.FLOAT,
                        allowNull: false
                    },
                    merchant_from_id: {
                        type: Sequelize.BIGINT,
                        onDelete: 'CASCADE',
                        allowNull: false,
                        references: {
                            model: 'merchants',
                            key: 'id'
                        }
                    },
                    merchant_to_id: {
                        type: Sequelize.BIGINT,
                        onDelete: 'CASCADE',
                        allowNull: false,
                        references: {
                            model: 'merchants',
                            key: 'id'
                        }
                    },
                    requested_by: {
                        type: Sequelize.BIGINT,
                        allowNull: false,
                        references: {
                            model: 'users',
                            key: 'id'
                        }
                    },
                    status_id: {
                        type: Sequelize.INTEGER,
                        allowNull: false,
                        references: {
                            model: 'internal_transfer_status',
                            key: 'id'
                        }
                    },
                    description: {
                        type: Sequelize.STRING,
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

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
        }
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('internal_transfers');
    }
};
