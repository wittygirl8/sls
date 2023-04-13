'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        await queryInterface.bulkInsert(
            'document_types',
            [
                {
                    id: 12,
                    name: 'Street View',
                    created_at: new Date(),
                    updated_at: new Date()
                },
                {
                    id: 13,
                    name: 'Food Hygiene Certificate',
                    created_at: new Date(),
                    updated_at: new Date()
                }
            ],
            { transaction: transaction }
        );

        await transaction.commit();
    },
    down: async (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('document_types', [
            {
                name: ['Street View', 'Food Hygiene Certificate']
            }
        ]);
    }
};
