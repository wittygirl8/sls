'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        await queryInterface.bulkInsert(
            'document_types',
            [
                {
                    id: 9,
                    name: 'Proof of ID Frontside',
                    created_at: new Date(),
                    updated_at: new Date()
                },
                {
                    id: 10,
                    name: 'Proof of ID Backside',
                    created_at: new Date(),
                    updated_at: new Date()
                },
                {
                    id: 11,
                    name: 'Business Registration Certificate',
                    created_at: new Date(),
                    updated_at: new Date()
                }
            ],
            { transaction: transaction }
        );

        await transaction.commit();
    }
};
