'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('canonical_resellers', 'support_number', {
            type: Sequelize.DataTypes.STRING,
            allowNull: true
        });
        await queryInterface.addColumn('canonical_resellers', 'support_email', {
            type: Sequelize.DataTypes.STRING,
            allowNull: true
        });
        await queryInterface.addColumn('canonical_resellers', 'logo_url', {
            type: Sequelize.DataTypes.STRING,
            allowNull: true
        });
        await queryInterface.addColumn('canonical_resellers', 'css_url', {
            type: Sequelize.DataTypes.STRING,
            allowNull: true
        });
        await queryInterface.addColumn('canonical_resellers', 'trading_name', {
            type: Sequelize.DataTypes.STRING,
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('canonical_resellers', 'support_number');
        await queryInterface.removeColumn('canonical_resellers', 'support_email');
        await queryInterface.removeColumn('canonical_resellers', 'logo_url');
        await queryInterface.removeColumn('canonical_resellers', 'css_url');
        await queryInterface.removeColumn('canonical_resellers', 'trading_name');
    }
};
