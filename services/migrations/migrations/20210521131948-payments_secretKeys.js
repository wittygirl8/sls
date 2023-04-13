'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('payments_configuration', 'access_key', {
            type: Sequelize.DataTypes.STRING,
            allowNull: true
        });
        await queryInterface.addColumn('payments_configuration', 'secret_key', {
            type: Sequelize.DataTypes.STRING,
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('payments_configuration', 'access_key');
        await queryInterface.removeColumn('payments_configuration', 'secret_key');
    }
};
