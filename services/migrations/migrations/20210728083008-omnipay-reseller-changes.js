'use strict';

module.exports = {
    up: async (queryInterface) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.bulkUpdate(
                'resellers',
                {
                    website: 'https://www.portal.omni-pay.com/',
                    portal_url: 'portal.omni-pay.com'
                },
                {
                    id: 1
                },
                { transaction }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
        }
    },

    down: async () => {}
};
