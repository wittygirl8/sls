'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('merchants_external_merchant_ids_relationship', {
            id: {
                type: Sequelize.DataTypes.BIGINT,
                primaryKey: true
            },
            merchant_id: {
                type: Sequelize.DataTypes.BIGINT,
                references: {
                    model: 'merchants',
                    key: 'id'
                }
            },
            index: Sequelize.DataTypes.INTEGER,
            external_merchant_id: Sequelize.DataTypes.STRING,
            external_merchant_store_id: Sequelize.DataTypes.STRING,
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('merchants_external_merchant_ids_relationship');
    }
};
