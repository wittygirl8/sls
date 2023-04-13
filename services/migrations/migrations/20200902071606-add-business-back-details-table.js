'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.createTable(
                'business_bank_details',
                {
                    id: {
                        type: Sequelize.DataTypes.BIGINT,
                        primaryKey: true
                    },
                    sort_code: Sequelize.INTEGER,
                    new_account_number: Sequelize.INTEGER,
                    account_holder_name: Sequelize.STRING,
                    created_at: {
                        allowNull: false,
                        type: Sequelize.DATE
                    },
                    updated_at: {
                        allowNull: false,
                        type: Sequelize.DATE
                    }
                },
                { transaction: transaction }
            );

            await queryInterface.addColumn(
                'merchants',
                'business_bank_details_id',
                {
                    type: Sequelize.DataTypes.BIGINT,
                    references: {
                        model: 'business_bank_details',
                        key: 'id'
                    }
                },
                { transaction: transaction }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.removeColumn('merchants', 'business_bank_details_id', { transaction: transaction });
            await queryInterface.dropTable('business_bank_details', { transaction: transaction });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
        }
    }
};
