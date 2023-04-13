'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        queryInterface.bulkInsert('user_types', [
            {
                name: 'SuperAdmin',
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        queryInterface.bulkDelete('user_types', [
            {
                name: 'SuperAdmin'
            }
        ]);
    }
};
