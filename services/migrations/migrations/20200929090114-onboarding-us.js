'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.addColumn(
                'business_details',
                'employee_id_number',
                {
                    type: Sequelize.DataTypes.STRING,
                    allowNull: true
                },
                { transaction }
            );

            await queryInterface.addColumn(
                'business_bank_details',
                'routing_number',
                {
                    type: Sequelize.DataTypes.STRING,
                    allowNull: true
                },
                { transaction }
            );

            await queryInterface.addColumn(
                'business_bank_details',
                'name_of_bank',
                {
                    type: Sequelize.DataTypes.STRING,
                    allowNull: true
                },
                { transaction }
            );

            await queryInterface.addColumn(
                'owners_details',
                'ssn_last_digits',
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
            await queryInterface.removeColumn('business_details', 'employee_id_number', { transaction });
            await queryInterface.removeColumn('business_bank_details', 'routing_number', { transaction });
            await queryInterface.removeColumn('business_bank_details', 'bank_name', { transaction });
            await queryInterface.removeColumn('owner_details', 'ssn_last_digits', { transaction });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
        }
    }
};
