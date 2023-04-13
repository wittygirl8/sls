'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        await queryInterface.bulkInsert(
            'roles',
            [
                {
                    id: 5,
                    name: 'Agent',
                    created_at: new Date(),
                    updated_at: new Date()
                }
            ],
            { transaction: transaction }
        );
        await transaction.commit();
    },
    down: async (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('roles', [
            {
                name: 'Agent'
            }
        ]);
    }
};
