'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.removeColumn('business_bank_details', 'is_validated', { transaction });
            await queryInterface.addColumn(
                'business_bank_details',
                'status',
                {
                    type: Sequelize.DataTypes.STRING,
                    defaultValue: 'Unverified'
                },
                { transaction }
            );

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            console.log(err);
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.removeColumn('business_bank_details', 'status', { transaction });
            await queryInterface.addColumn('business_bank_details', 'is_validated', {
                type: Sequelize.DataTypes.BOOLEAN,
                defaultValue: false
            });

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            console.log(err);
        }
    }
};
