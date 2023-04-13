'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('business_profile', 'business_type');
        await queryInterface.removeColumn('business_profile', 'is_start_up');
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('business_profile', 'business_type', {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        });
        await queryInterface.addColumn('business_profile', 'is_start_up', {
            type: Sequelize.DataTypes.BOOLEAN,
            allowNull: false
        });
    }
};
