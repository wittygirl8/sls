'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('merchants', 'allow_withdrawals', {
            type: Sequelize.DataTypes.BOOLEAN,
            defaultValue: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('merchants', 'allow_withdrawals');
    }
};
