'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.bulkUpdate(
                'resellers',
                {
                    address: 'Innovation Way, Stoke-on-Trent ST6 4BF, United Kingdom'
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
    }
};
