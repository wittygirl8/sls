'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.changeColumn('business_details', 'business_type_id', {
          type: Sequelize.BIGINT,
          allowNull: true,
      });
  },

  down: async (queryInterface, Sequelize) => {
  }
};
