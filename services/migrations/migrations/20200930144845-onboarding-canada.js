'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.addColumn(
                'business_bank_details',
                'transit_number',
                {
                    type: Sequelize.DataTypes.STRING,
                    allowNull: true
                },
                { transaction }
            );
            await queryInterface.addColumn(
                'business_bank_details',
                'financial_institution_number',
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
            await queryInterface.removeColumn('business_bank_details', 'transit_number', { transaction });
            await queryInterface.removeColumn('business_bank_details', 'financial_institution_number', { transaction });
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
        }
    }
};
