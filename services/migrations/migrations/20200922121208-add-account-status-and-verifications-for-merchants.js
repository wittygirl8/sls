'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('merchants', 'account_status', {
            type: Sequelize.STRING,
            defaultValue: "Pending"
        });
        await queryInterface.addColumn('merchants', 'is_bank_account_verified', {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        });
        await queryInterface.addColumn('merchants', 'is_account_verified', {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('merchants', 'account_status');
        await queryInterface.removeColumn('merchants', 'is_bank_account_verified');
        await queryInterface.removeColumn('merchants', 'is_account_verified');
    }
};
