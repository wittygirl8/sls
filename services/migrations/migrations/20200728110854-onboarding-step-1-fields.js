'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.createTable('addresses', {
      id: {
        type: Sequelize.DataTypes.BIGINT,
        primaryKey: true
      },
      phone_number: Sequelize.DataTypes.STRING,
      post_code: Sequelize.DataTypes.STRING,
      address_line_1: Sequelize.DataTypes.STRING,
      address_line_2: Sequelize.DataTypes.STRING,
      city: Sequelize.DataTypes.STRING,
      country: Sequelize.DataTypes.STRING,
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addColumn('merchants', 'onboarding_step', {
      type: Sequelize.DataTypes.INTEGER,
      defaultValue: 1
    });

    await queryInterface.addColumn('merchants', 'legal_name', {
      type: Sequelize.DataTypes.STRING
    });

    await queryInterface.addColumn('merchants', 'base_address_id', {
      type: Sequelize.DataTypes.BIGINT,
      references: {
        model: 'addresses',
        key: 'id'
      }
    });

    await queryInterface.addColumn('merchants', 'trading_address_id', {
      type: Sequelize.DataTypes.BIGINT,
      references: {
        model: 'addresses',
        key: 'id'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.removeColumn('merchants', 'base_address_id');
    await queryInterface.removeColumn('merchants', 'trading_address_id');
    await queryInterface.dropTable('addresses');
    await queryInterface.removeColumn('merchants', 'onboarding_step');
    await queryInterface.removeColumn('merchants', 'legal_name');
  }
};
