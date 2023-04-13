'use strict';
const { flakeGenerateDecimal } = require('../libs/flake.generator');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('roles', [
        {
          id: flakeGenerateDecimal(),
          name: 'Owner',
          created_at: new Date(),
          updated_at: new Date()
        },
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('roles', [
        {
            name: 'Owner',
        },
    ]);
  }
};
