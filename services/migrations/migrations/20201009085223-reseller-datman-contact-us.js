'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.bulkUpdate(
                'resellers',
                {
                    contact_us_page_url:
                        'https://datman.zendesk.com/hc/en-us/sections/360001170817-I-m-a-Takeaway-Owner'
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

    down: async (queryInterface, Sequelize) => {}
};
