'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('transaction_profile', 'max_ticket_value', {
            type: Sequelize.DataTypes.DECIMAL(7, 2)
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('transaction_profile', 'max_ticket_value');
    }
};
