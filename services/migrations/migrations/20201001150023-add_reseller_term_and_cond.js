'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
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

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.removeColumn('resellers', 'term_and_cond_page_url', { transaction });
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
        }
    }
};
