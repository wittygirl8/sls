'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('payments_configuration', 'cs_customer_id', {
            type: Sequelize.DataTypes.STRING,
            allowNull: true
        });
        await queryInterface.addColumn('payments_configuration', 'cs_merchant_id', {
            type: Sequelize.DataTypes.STRING,
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('payments_configuration', 'cs_customer_id');
        await queryInterface.removeColumn('payments_configuration', 'cs_merchant_id');
    }
};
