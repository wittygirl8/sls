'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('business_types', [
            {
                name: 'Charity',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                name: 'Corporate Entity',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                name: 'Discretionary Trading Trust',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                name: 'Other',
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('business_types', [
            {
                name: ['Charity', 'Corporate Entity', 'Discretionary Trading Trust', 'Other']
            }
        ]);
    }
};
