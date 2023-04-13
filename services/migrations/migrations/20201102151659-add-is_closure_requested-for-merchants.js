'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('merchants', 'is_closure_requested', {
            type: Sequelize.DataTypes.BOOLEAN,
            defaultValue: false
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('merchants', 'is_closure_requested');
    }
};
