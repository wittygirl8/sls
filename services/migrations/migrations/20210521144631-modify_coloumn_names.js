'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        queryInterface.renameColumn('business_details', 'reg_business_flag', 'is_registered_business');
        queryInterface.renameColumn('business_details', 'same_Name_flag', 'is_account_name_same');
    },

    down: async (queryInterface, Sequelize) => {
        queryInterface.renameColumn('business_details', 'reg_business_flag', 'is_registered_business');
        queryInterface.renameColumn('business_details', 'same_Name_flag', 'is_account_name_same');
    }
};
