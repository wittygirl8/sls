'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('merchants', 'last_zoho_accounts_sync_at', {
            type: Sequelize.DataTypes.DATE,
            allowNull: true
        });

        await queryInterface.addIndex('merchants', ['last_zoho_accounts_sync_at']);
    },

    down: async (queryInterface) => {
        await queryInterface.removeColumn('merchants', 'last_zoho_accounts_sync_at');
    }
};
