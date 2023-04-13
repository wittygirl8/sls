'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Merchants', 'businessId', {
            type: Sequelize.STRING,
            after: 'clientId',
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Merchants', 'businessId', Sequelize.STRING);
    },
};
