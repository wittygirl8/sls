'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.bulkInsert(
                'canonical_resellers',
                [
                    {
                        id: 1,
                        company_name: 'OmniPay',
                        primary_contact_name: 'OmniPay Reseller',
                        primary_contact_email: 'shalini.s+canonicalreseller1@datman.je',
                        created_at: new Date(),
                        updated_at: new Date()
                    },
                    {
                        id: 2,
                        company_name: 'T2S',
                        primary_contact_name: 'Ardian Mula',
                        primary_contact_email: 'adi@foodhub.com',
                        created_at: new Date(),
                        updated_at: new Date()
                    },
                    {
                        id: 3,
                        company_name: 'Test Reseller',
                        primary_contact_name: 'Test Canonical Reseller',
                        primary_contact_email: 'shalini.s+canonicalreseller3@datman.je',
                        created_at: new Date(),
                        updated_at: new Date()
                    }
                ],
                { transaction: transaction }
            );

            await transaction.commit();

            //Exclude non t2s merchants and mark everything else as under t2s reseller
            await queryInterface.sequelize.query(
                `
                UPDATE merchants
                SET canonical_reseller_id = 2
                WHERE id not in ( SELECT distinct(merchant_id) from relationships where reseller_id != 2 and merchant_id is not null) ;`
            );
        } catch (err) {
            await transaction.rollback();
        }
    }
};
