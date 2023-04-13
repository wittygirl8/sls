'use strict';
const { flakeGenerateDecimal } = require('../libs/flake.generator');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('business_types', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.BIGINT
            },
            name: {
                type: Sequelize.STRING
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        await queryInterface.bulkInsert('business_types', [
            {
                id: flakeGenerateDecimal(),
                name: 'Limited',
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
        await queryInterface.bulkInsert('business_types', [
            {
                id: flakeGenerateDecimal(),
                name: 'Sole Trader',
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
        await queryInterface.bulkInsert('business_types', [
            {
                id: flakeGenerateDecimal(),
                name: 'LLP',
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
        await queryInterface.bulkInsert('business_types', [
            {
                id: flakeGenerateDecimal(),
                name: 'PLC',
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
        await queryInterface.bulkInsert('business_types', [
            {
                id: flakeGenerateDecimal(),
                name: 'Partnership',
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('business_types', [
            {
                name: ['Limited', 'Sole Trader', 'LLP', 'PLC', 'Partnership']
            }
        ]);

        await queryInterface.dropTable('business_types');
    }
};
