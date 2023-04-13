'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.changeColumn('business_bank_details', 'sort_code', {
                type: Sequelize.DataTypes.STRING
            });
            await queryInterface.changeColumn('business_bank_details', 'new_account_number', {
                type: Sequelize.DataTypes.STRING
            });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.changeColumn('business_bank_details', 'sort_code', {
                type: Sequelize.DataTypes.INTEGER
            });
            await queryInterface.changeColumn('business_bank_details', 'new_account_number', {
                type: Sequelize.DataTypes.INTEGER
            });
        } catch (error) {
            await transaction.rollback();
        }
    }
};
