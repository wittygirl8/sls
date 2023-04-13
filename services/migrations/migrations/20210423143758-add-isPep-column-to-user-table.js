'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('users', 'is_pep', {
            type: Sequelize.DataTypes.BOOLEAN,
            defaultValue: false
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('users', 'is_pep');
    }
};
