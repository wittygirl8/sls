'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.bulkUpdate(
                'resellers',
                {
                    name: 'Omni-Pay',
                    favicon_link:
                        'https://logos-general.s3-eu-west-1.amazonaws.com/resellers-logos/omni-pay_favicon.ico',
                    logo: 'https://logos-general.s3-eu-west-1.amazonaws.com/resellers-logos/omni-pay.png',
                    sender_email: 'no-reply@omni-pay.com',
                    support_email: 'wecare@omni-pay.com',
                    contact_us_page_url: 'https://omni-pay.com/contact-us/'
                },
                { id: 1 },
                { transaction }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
        }
    }
};
