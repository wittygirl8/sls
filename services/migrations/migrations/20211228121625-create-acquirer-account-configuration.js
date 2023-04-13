'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('acquirer_account_configuration', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            merchantId: {
                type: Sequelize.DataTypes.INTEGER,
                field: 'merchant_id'
            },
            adyen_sub_account_id: {
                type: Sequelize.DataTypes.STRING
            },
            gateway: {
                type: Sequelize.DataTypes.STRING
            },
            acquirer: {
                type: Sequelize.DataTypes.STRING
            },
            productType: {
                type: Sequelize.DataTypes.ENUM('GFO'),
                field: 'product_type',
                allowNull: false,
                defaultValue: 'GFO'
            },
            priority: {
                type: Sequelize.DataTypes.STRING,
                field: 'priority'
            },
            accountStatus: {
                type: Sequelize.DataTypes.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'CLOSED'),
                field: 'account_status',
                allowNull: false,
                defaultValue: 'INACTIVE'
            },
            applicationId: {
                type: Sequelize.DataTypes.INTEGER,
                field: 'application_id'
            },
            reason: {
                type: Sequelize.DataTypes.STRING,
                field: 'payout_reason',
                defaultValue: JSON.stringify({})
            },
            payoutStatus: {
                type: Sequelize.DataTypes.STRING,
                field: 'payout_status'
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
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('acquirer_account_configuration');
    }
};
