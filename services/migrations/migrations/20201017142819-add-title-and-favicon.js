'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.addColumn('resellers', 'portal_title', {
                type: Sequelize.DataTypes.STRING
            });
            await queryInterface.addColumn('resellers', 'favicon_link', {
                type: Sequelize.DataTypes.STRING
            });

            await queryInterface.bulkUpdate(
                'resellers',
                {
                    portal_title: 'Customer Portal',
                    favicon_link: 'https://logos-general.s3-eu-west-1.amazonaws.com/resellers-logos/my_pay_favicon.ico'
                },
                {
                    id: 1
                },
                { transaction }
            );
            await queryInterface.bulkUpdate(
                'resellers',
                {
                    portal_title: 'Datman Portal',
                    favicon_link: 'https://logos-general.s3-eu-west-1.amazonaws.com/resellers-logos/datman_favicon.ico'
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
