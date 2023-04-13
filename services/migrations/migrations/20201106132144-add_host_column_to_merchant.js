'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('merchants', 'host', {
            type: Sequelize.STRING
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('merchants', 'host');
    }
};
