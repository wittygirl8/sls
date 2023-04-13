'use strict';
const { nanoid } = require('nanoid');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('Roles', [
            {
                id: nanoid(),
                name: 'Manager',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Roles', [
            {
                name: 'Manager',
            },
        ]);
    },
};
