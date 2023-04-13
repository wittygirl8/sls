'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('merchants', 'stripe_acc_type', {
            type: Sequelize.DataTypes.STRING,
            defaultValue: 'DATMAN'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('merchants', 'stripe_acc_type');
    }
};
