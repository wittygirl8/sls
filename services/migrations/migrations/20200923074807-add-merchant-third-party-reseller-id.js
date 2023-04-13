'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
        await queryInterface.createTable(
            'merchant_resellers',
            {
                id: {
                    type: Sequelize.BIGINT,
                    primaryKey: true
                },
                merchant_id: {
                  type: Sequelize.BIGINT,
                  onDelete: 'CASCADE',
                  allowNull: false,
                  references: {
                      model: 'merchants',
                      key: 'id'
                  }
                },
                reseller_reference: {
                  type: Sequelize.INTEGER,
                  allowNull: false
                },
                created_at: {
                    type: Sequelize.DATE,
                    allowNull: false
                },
                updated_at: {
                    type: Sequelize.DATE,
                    allowNull: false
                }
            },
            { transaction: transaction }
        );

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('merchant_resellers');
  }
};
