'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.renameColumn('resellers', 'website_url', 'portal_url', { transaction });
            await queryInterface.bulkUpdate(
                'resellers',
                {
                    portal_url: 'portal.mypay.co.uk'
                },
                {
                    id: 1
                },
                { transaction }
            );
            await queryInterface.bulkUpdate(
                'resellers',
                {
                    portal_url: 'portal.datmancrm.com'
                },
                {
                    id: 2
                },
                { transaction }
            );

            await queryInterface.addColumn(
                'resellers',
                'support_tel_no',
                {
                    type: Sequelize.DataTypes.STRING
                },
                { transaction }
            );
            await queryInterface.bulkUpdate(
                'resellers',
                {
                    support_tel_no: '7123456789'
                },
                {
                    id: 1
                },
                { transaction }
            );
            await queryInterface.bulkUpdate(
                'resellers',
                {
                    support_tel_no: '7123456789'
                },
                {
                    id: 2
                },
                { transaction }
            );

            await queryInterface.renameColumn('resellers', 'email', 'support_email', { transaction });

            await queryInterface.addColumn(
                'resellers',
                'branding_url',
                {
                    type: Sequelize.DataTypes.STRING
                },
                { transaction }
            );
            await queryInterface.bulkUpdate(
                'resellers',
                {
                    branding_url: 'https:/s3-mypay-brand.css'
                },
                {
                    id: 1
                },
                { transaction }
            );
            await queryInterface.bulkUpdate(
                'resellers',
                {
                    branding_url: 'https:/s3-datman-brand.css'
                },
                {
                    id: 2
                },
                { transaction }
            );

            await queryInterface.addColumn(
                'resellers',
                'sender_email',
                {
                    type: Sequelize.DataTypes.STRING
                },
                { transaction }
            );
            await queryInterface.bulkUpdate(
                'resellers',
                {
                    sender_email: 'no-reply@mypay.co.uk'
                },
                {
                    id: 1
                },
                { transaction }
            );
            await queryInterface.bulkUpdate(
                'resellers',
                {
                    sender_email: 'no-reply@datman.co.uk'
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

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.renameColumn('resellers', 'portal_url', 'website_url', { transaction });
            await queryInterface.removeColumn('resellers', 'support_tel_no', { transaction });
            await queryInterface.renameColumn('resellers', 'support_email', 'email', { transaction });
            await queryInterface.removeColumn('resellers', 'branding_url', { transaction });
            await queryInterface.removeColumn('resellers', 'sender_email', { transaction });

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            console.log(err);
        }
    }
};
