'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('business_details', 'email', {
            type: Sequelize.DataTypes.STRING,
            allowNull: true
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('business_details', email);
    }
};
