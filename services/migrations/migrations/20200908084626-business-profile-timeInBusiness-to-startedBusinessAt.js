'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('business_profile', 'time_in_business');
        await queryInterface.addColumn('business_profile', 'started_business_at', {
            type: Sequelize.DataTypes.DATE,
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('business_profile', 'started_business_at');
        await queryInterface.addColumn('business_profile', 'time_in_business', {
            type: Sequelize.DataTypes.STRING,
            allowNull: true
        });
    }
};
