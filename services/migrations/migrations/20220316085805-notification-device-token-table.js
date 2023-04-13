'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('push_notification_device_ids', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            merchantId: {
                type: Sequelize.INTEGER,
                field: 'merchant_id'
            },
            deviceId: {
                type: Sequelize.STRING,
                field: 'device_id'
            },
            platformEndpoint: {
                type: Sequelize.STRING,
                field: 'platform_endpoint'
            },
            deviceModel: {
                type: Sequelize.STRING,
                field: 'device_model'
            },
            state: {
                type: Sequelize.DataTypes.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'CLOSED'),
                field: 'state'
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

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('push_notification_device_ids');
    }
};
