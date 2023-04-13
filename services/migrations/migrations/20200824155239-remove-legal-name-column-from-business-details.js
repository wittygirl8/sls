'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('business_details', 'legal_name');
  },

  down: async (queryInterface, Sequelize) => {
  }
};
