'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('merchants', 'country', {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
            defaultValue: 'United Kingdom'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('merchants', 'country');
    }
};
