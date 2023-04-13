'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.createTable(
                'withdrawals',
                {
                    id: {
                        type: Sequelize.BIGINT,
                        primaryKey: true
                    },
                    amount: {
                        type: Sequelize.FLOAT,
                        allowNull: false
                    },
                    merchant_id: {
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
                            model: 'withdrawal_status',
                            key: 'id'
                        }
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
        await queryInterface.dropTable('withdrawals');
    }
};
