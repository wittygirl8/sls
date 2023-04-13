'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
        await queryInterface.addColumn(
            'merchants',
            'datman_merchant_id',
            {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: true
            },
            { transaction }
        );

        await transaction.commit();

    } catch(error) {
        await transaction.rollback();
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
        await queryInterface.removeColumn('merchants', 'datman_merchant_id', { transaction });
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
    }
  }
};
