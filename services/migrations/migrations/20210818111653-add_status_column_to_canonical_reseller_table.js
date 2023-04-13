'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('canonical_resellers', 'status', {
            type: Sequelize.DataTypes.INTEGER,
            defaultValue: 0
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('canonical_resellers', 'status');
    }
};
