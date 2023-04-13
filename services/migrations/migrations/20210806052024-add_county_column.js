'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('addresses', 'county', {
            type: Sequelize.DataTypes.STRING,
            defaultValue: ''
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('addresses', 'county');
    }
};
