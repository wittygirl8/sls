'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.bulkUpdate(
                'resellers',
                { help_page_url: 'https://support.datman.je/' },
                { id: 2 },
                { transaction }
            );
            await queryInterface.bulkUpdate(
                'resellers',
                { help_page_url: 'https://support.datman.je/' },
                { id: 3 },
                { transaction }
            );
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
        }
    }
};
