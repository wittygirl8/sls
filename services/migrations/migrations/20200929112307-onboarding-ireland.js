'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.addColumn(
                'business_bank_details',
                'bank_address_1',
                {
                    type: Sequelize.DataTypes.STRING,
                    allowNull: true
                },
                { transaction }
            );

            await queryInterface.addColumn(
                'business_bank_details',
                'bank_address_2',
                {
                    type: Sequelize.DataTypes.STRING,
                    allowNull: true
                },
                { transaction }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.removeColumn('business_bank_details', 'bank_address_1', { transaction });
            await queryInterface.removeColumn('business_bank_details', 'bank_address_2', { transaction });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
        }
    }
};
