'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('merchants', 'status', {
            type: Sequelize.DataTypes.INTEGER,
            defaultValue: 0
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('merchants', 'status');
    }
};
