'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.sequelize.query(`LOCK TABLES SequelizeMeta WRITE;`, { raw: true });
            await queryInterface.sequelize.query(
                `UPDATE SequelizeMeta SET name = '20200907132837-remove-businessType-startup-from-business-profile.js'
          where name = '20200907132837-remove-businessType-startup-from-business-profile.js.js';`,
                { raw: true }
            );

            await queryInterface.sequelize.query(`UNLOCK TABLES;`, { raw: true });

            await queryInterface.addColumn(
                'resellers',
                'website',
                {
                    type: Sequelize.DataTypes.STRING,
                    allowNull: true
                },
                { transaction }
            );

            await queryInterface.addColumn(
                'resellers',
                'address',
                {
                    type: Sequelize.DataTypes.STRING,
                    allowNull: true
                },
                { transaction }
            );

            await queryInterface.bulkUpdate(
                'resellers',
                {
                    name: 'Mypay',
                    support_email: 'support@mypay.co.uk',
                    website: 'https://www.portal.mypay.co.uk/',
                    address: 'Sarnia House Le Truchot St Peter Port,GY1 1GR',
                    term_and_cond_page_url: 'https:/s3-url-tandc.html'
                },
                {
                    id: 1
                },
                { transaction }
            );

            await queryInterface.bulkUpdate(
                'resellers',
                {
                    name: 'Datman',
                    support_email: 'support@datman.je',
                    website: 'https://portal.datmancrm.com/',
                    address: 'Datman address',
                    logo: 'Datman',
                    term_and_cond_page_url: 'https:/s3-url-tandc.html'
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
            await queryInterface.removeColumn('resellers', 'website', { transaction });
            await queryInterface.removeColumn('resellers', 'address', { transaction });
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
        }
    }
};
