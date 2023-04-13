'use strict';

const { flakeGenerateDecimal } = require('../libs/flake.generator');


module.exports = {
    up: async (queryInterface, Sequelize) => {
        queryInterface.bulkInsert('user_types', [
            {
                id: flakeGenerateDecimal(),
                name: 'Admin',
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        queryInterface.bulkDelete('user_types', [
            {
                name: 'Admin'
            }
        ]);
    }
};
