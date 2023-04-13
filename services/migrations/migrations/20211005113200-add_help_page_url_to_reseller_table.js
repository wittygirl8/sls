'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.bulkUpdate(
                'resellers',
                { help_page_url: 'https://portal.omni-pay.com/help' },
                { id: 1 },
                { transaction }
            );

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
        }
    }
};
