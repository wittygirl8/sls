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

            await queryInterface.addColumn(
                'resellers',
                'email',
                {
                    type: Sequelize.DataTypes.STRING,
                    allowNull: true
                },
                { transaction }
            );

            await queryInterface.bulkUpdate(
                'resellers',
                {
                    email: 'reseller@mypay.co.uk'
                },
                {
                    id: 1
                },
                { transaction }
            );

            await queryInterface.bulkUpdate(
                'resellers',
                {
                    email: 'reseller@t2s.co.uk'
                },
                {
                    id: 2
                },
                { transaction }
            );

            await queryInterface.addColumn('business_details', 'email', {
                type: Sequelize.DataTypes.STRING,
                allowNull: true
            });

            await queryInterface.addColumn(
                'resellers',
                'term_and_cond_page_url',
                {
                    type: Sequelize.DataTypes.STRING
                },
                { transaction }
            );

            await queryInterface.bulkUpdate(
                'resellers',
                {
                    term_and_cond_page_url: 'https://mypay.co.uk/term&cond'
                },
                {
                    id: 1
                },
                { transaction }
            );

            await queryInterface.bulkUpdate(
                'resellers',
                {
                    term_and_cond_page_url: 'https://fake.mypay.co.uk/term&cond'
                },
                {
                    id: 2
                },
                { transaction }
            );
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
            await queryInterface.removeColumn('business_bank_details', 'transit_number', { transaction });
            await queryInterface.removeColumn('business_bank_details', 'financial_institution_number', { transaction });
            await queryInterface.removeColumn('resellers', 'email', { transaction });
            await queryInterface.removeColumn('business_details', 'email', { transaction });
            await queryInterface.removeColumn('resellers', 'term_and_cond_page_url', { transaction });
            await queryInterface.changeColumn('business_profile', 'stock_location', {
                type: Sequelize.DataTypes.STRING,
                allowNull: false
            });
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
        }
    }
};
