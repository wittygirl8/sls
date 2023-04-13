'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.bulkUpdate(
                'resellers',
                {
                    name: 'OmniPay'
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
