'use strict';
const { flakeGenerateDecimal } = require('../libs/flake.generator');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert('Roles', [
            {
                id: flakeGenerateDecimal(),
                name: 'Admin',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: flakeGenerateDecimal(),
                name: 'User',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: flakeGenerateDecimal(),
                name: 'Manager',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);

        await queryInterface.bulkInsert('user_types', [
            {
                id: flakeGenerateDecimal(),
                name: 'Business',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: flakeGenerateDecimal(),
                name: 'Client',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: flakeGenerateDecimal(),
                name: 'Merchant',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete(
            'Roles',
            {
                where: {
                    name: ['Admin', 'User', 'Manager']
                }
            },
            {}
        );
        await queryInterface.bulkDelete(
            'UserTypes',
            {
                where: {
                    name: ['Business', 'Client', 'Merchant']
                }
            },
            {}
        );
    }
};
