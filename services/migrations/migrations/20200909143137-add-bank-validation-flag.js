'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('business_bank_details', 'is_validated', {
            type: Sequelize.DataTypes.BOOLEAN,
            defaultValue: false
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('business_bank_details', 'is_validated');
    }
};
