'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('canonical_resellers', 'website_url', {
            type: Sequelize.DataTypes.STRING,
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('canonical_resellers', 'website_url');
    }
};
