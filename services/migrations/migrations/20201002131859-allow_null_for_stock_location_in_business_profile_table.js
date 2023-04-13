'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.changeColumn('business_profile', 'stock_location', {
                type: Sequelize.DataTypes.STRING,
                allowNull: true
            });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.changeColumn('business_profile', 'stock_location', {
                type: Sequelize.DataTypes.STRING,
                allowNull: false
            });
        } catch (error) {
            await transaction.rollback();
        }
    }
};
