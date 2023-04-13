'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('merchants', 'is_push_notification_enabled', {
            type: Sequelize.DataTypes.BOOLEAN,
            defaultValue: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('merchants', 'is_push_notification_enabled');
    }
};
