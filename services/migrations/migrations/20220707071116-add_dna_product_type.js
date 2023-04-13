'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        let { DataTypes } = Sequelize;

        await queryInterface.changeColumn('acquirer_account_configuration', 'product_type', {
            type: DataTypes.ENUM('GFO', 'A920'),
            allowNull: false
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('acquirer_account_configuration', 'product_type');
    }
};
