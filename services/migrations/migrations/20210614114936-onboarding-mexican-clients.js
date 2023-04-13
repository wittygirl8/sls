'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('addresses', 'state', {
            type: Sequelize.DataTypes.STRING,
            defaultValue: ''
        });
        await queryInterface.addColumn('owners_details', 'personal_id', {
            type: Sequelize.DataTypes.STRING,
            defaultValue: ''
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('addresses', 'state');
        await queryInterface.removeColumn('owners_details', 'personal_id');
    }
};
