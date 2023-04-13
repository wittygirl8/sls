'use strict';
module.exports = {
    up: async (queryInterface) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.bulkUpdate(
                'resellers',
                {
                    help_page_url: null //Removing URL to show internal help page
                },
                {
                    id: 1
                },
                { transaction }
            );
            await queryInterface.bulkUpdate(
                'resellers',
                {
                    help_page_url: 'https://datman.zendesk.com/hc/en-us/sections/360001170817-I-m-a-Takeaway-Owner'
                },
                {
                    id: 2
                },
                { transaction }
            );

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            console.log(err);
        }
    },
    down: async (queryInterface, Sequelize) => {}
};
