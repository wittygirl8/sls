'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.bulkUpdate(
                'resellers',
                { support_email: 'salesupport@mypay.co.uk' },
                { id: 1 },
                { transaction }
            );
            await queryInterface.bulkUpdate(
                'resellers',
                { support_email: 'info@datman.je' },
                { id: 2 },
                { transaction }
            );
            await queryInterface.bulkUpdate(
                'resellers',
                { support_email: 'info@datman.je' },
                { id: 3 },
                { transaction }
            );

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.bulkUpdate(
                'resellers',
                { support_email: 'support@mypay.co.uk' },
                { id: 1 },
                { transaction }
            );
            await queryInterface.bulkUpdate(
                'resellers',
                { support_email: 'support@datman.je' },
                { id: 2 },
                { transaction }
            );
            await queryInterface.bulkUpdate(
                'resellers',
                { support_email: 'support@datman.je' },
                { id: 3 },
                { transaction }
            );

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
        }
    }
};
