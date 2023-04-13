'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('payments_configuration', {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true
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
            acquirer_bank: {
                type: Sequelize.STRING,
                allowNull: true
            },
            test_mode: {
                type: Sequelize.BOOLEAN,
                allowNull: true
            },
            three_d_secure: {
                type: Sequelize.BOOLEAN,
                allowNull: true
            },
            processor_id: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            terminal_id: {
                type: Sequelize.BIGINT,
                allowNull: true
            },
            mid: {
                type: Sequelize.BIGINT,
                allowNull: true
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('payments_configuration');
    }
};
