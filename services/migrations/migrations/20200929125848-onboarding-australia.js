'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.addColumn(
                'business_bank_details',
                'bsb',
                {
                    type: Sequelize.DataTypes.STRING,
                    allowNull: true
                },
                { transaction }
            );

            await transaction.commit();

        } catch(error) {
            await transaction.rollback();
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.removeColumn('business_bank_details', 'bsb', { transaction });
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
        }
    }
};
