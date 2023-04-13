'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('business_details', 'reg_business_flag', {
            type: Sequelize.DataTypes.BOOLEAN,
            defaultValue: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('business_details', 'reg_business_flag');
    }
};
