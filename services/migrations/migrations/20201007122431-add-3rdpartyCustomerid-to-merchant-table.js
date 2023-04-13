'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.addColumn('merchants', 'third_party_customer_id', {
                type: Sequelize.DataTypes.INTEGER
            });

            await queryInterface.removeColumn('merchants', 'datman_merchant_id');

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            console.log(err);
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.removeColumn('merchants', 'third_party_customer_id');

            await queryInterface.addColumn('merchants', 'datman_merchant_id', {
                type: Sequelize.DataTypes.INTEGER
            });

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            console.log(err);
        }
    }
};
