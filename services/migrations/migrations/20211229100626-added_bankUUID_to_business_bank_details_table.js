'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('business_bank_details', 'adyen_bank_uuid', {
            type: Sequelize.DataTypes.UUID,
            unique: true,
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('business_bank_details', 'adyen_bank_uuid');
    }
};
