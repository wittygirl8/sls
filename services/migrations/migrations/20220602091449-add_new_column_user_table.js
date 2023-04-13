'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('users', 'signup_status', {
            type: Sequelize.DataTypes.BOOLEAN,
            defaultValue: false
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('users', 'signup_status');
    }
};
