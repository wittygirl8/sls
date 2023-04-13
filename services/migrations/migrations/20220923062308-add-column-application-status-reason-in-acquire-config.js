'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        await queryInterface.addColumn(
            'acquirer_account_configuration',
            'application_status',
            {
                type: Sequelize.DataTypes.STRING,
                allowNull: true
            },
            {
                transaction: transaction
            }
        );
        await queryInterface.addColumn(
            'acquirer_account_configuration',
            'application_reason',
            {
                type: Sequelize.DataTypes.STRING,
                allowNull: true
            },
            {
                transaction: transaction
            }
        );
        await transaction.commit();
    },
    async down(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();

        await queryInterface.removeColumn('acquirer_account_configuration', 'application_status', {
            transaction: transaction
        });
        await queryInterface.removeColumn('acquirer_account_configuration', 'application_reason', {
            transaction: transaction
        });
        await transaction.commit();
    }
};
