'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('business_profile', {
            id: {
                type: Sequelize.DataTypes.BIGINT,
                primaryKey: true
            },
            merchant_id: {
                type: Sequelize.DataTypes.BIGINT,
                onDelete: 'CASCADE',
                allowNull: false,
                references: {
                    model: 'merchants',
                    key: 'id'
                }
            },
            business_type: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false
            },
            time_in_business: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false
            },
            is_start_up: {
                type: Sequelize.DataTypes.BOOLEAN,
                allowNull: false
            },
            is_business_making_products: {
                type: Sequelize.DataTypes.BOOLEAN,
                allowNull: false
            },
            stock_location: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false
            },
            is_stock_sufficient: {
                type: Sequelize.DataTypes.BOOLEAN,
                allowNull: false
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
        await queryInterface.dropTable('business_profile');
    }
};
