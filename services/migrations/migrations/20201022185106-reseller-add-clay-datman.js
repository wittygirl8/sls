'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.bulkInsert(
                'resellers',
                [
                    {
                        id: 3,
                        name: 'Datman',
                        logo: 'https://logos-general.s3-eu-west-1.amazonaws.com/resellers-logos/datman.png',
                        portal_url: 'clay.datmancrm.com',
                        contact_us_page_url:
                            'https://datman.zendesk.com/hc/en-us/sections/360001170817-I-m-a-Takeaway-Owner',
                        help_page_url: 'https://datman.zendesk.com/hc/en-us/sections/360001170817-I-m-a-Takeaway-Owner',
                        created_at: new Date(),
                        updated_at: new Date(),
                        support_email: 'support@datman.je',
                        term_and_cond_page_url: 'https:/s3-url-tandc.html',
                        support_tel_no: '7123456789',
                        branding_url: 'https:/s3-datman-brand.css',
                        sender_email: 'no-reply@datman.co.uk',
                        website: 'https://clay.datmancrm.com/',
                        address: 'Datman address',
                        portal_title: 'Datman Portal',
                        favicon_link:
                            'https://logos-general.s3-eu-west-1.amazonaws.com/resellers-logos/datman_favicon.ico'
                    }
                ],
                { transaction: transaction }
            );

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            console.log(err);
        }
    },
    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.bulkDelete(
                'resellers',
                {
                    id: 3
                },
                { transaction: transaction }
            );

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            console.log(err);
        }
    }
};
