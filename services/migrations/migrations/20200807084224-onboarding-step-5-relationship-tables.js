'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('merchants_products_descriptions', {
            id: {
                type: Sequelize.DataTypes.BIGINT,
                primaryKey: true
            },
            merchant_id: {
                type: Sequelize.DataTypes.BIGINT,
                references: {
                    model: 'merchants',
                    key: 'id'
                },
                allowNull: false
            },
            product_description_id: {
                type: Sequelize.DataTypes.BIGINT,
                references: {
                    model: 'product_descriptions',
                    key: 'id'
                },
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

        queryInterface.addConstraint('merchants_products_descriptions', {
            fields: ['product_description_id', 'merchant_id'],
            type: 'unique',
            name: 'fk_unique_constraint'
        });

        await queryInterface.createTable('merchants_business_descriptions', {
            id: {
                type: Sequelize.DataTypes.BIGINT,
                primaryKey: true
            },
            merchant_id: {
                type: Sequelize.DataTypes.BIGINT,
                references: {
                    model: 'merchants',
                    key: 'id'
                },
                allowNull: false
            },
            business_description_id: {
                type: Sequelize.DataTypes.BIGINT,
                references: {
                    model: 'business_descriptions',
                    key: 'id'
                },
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

        queryInterface.addConstraint('merchants_business_descriptions', {
            fields: ['business_description_id', 'merchant_id'],
            type: 'unique',
            name: 'fk_unique_constraint'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('merchants_products_descriptions');
        await queryInterface.dropTable('merchants_business_descriptions');
    }
};
