'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('documents', {
            id: {
                type: Sequelize.DataTypes.BIGINT,
                primaryKey: true,
                allowNull: false
            },
            filename: Sequelize.DataTypes.STRING,
            size: Sequelize.DataTypes.STRING,
            merchant_id: {
                type: Sequelize.DataTypes.BIGINT,
                onDelete: 'CASCADE',
                allowNull: true,
                references: {
                    model: 'merchants',
                    key: 'id'
                }
            },
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
        await queryInterface.dropTable('documents');
    }
};
