'use strict';
const { flakeGenerateDecimal } = require('../libs/flake.generator');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('products_required', {
            id: {
                type: Sequelize.DataTypes.BIGINT,
                primaryKey: true
            },
            name: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false
            },
            description: Sequelize.DataTypes.STRING,
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        await queryInterface.createTable('merchants_products_required', {
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
            product_required_id: {
                type: Sequelize.DataTypes.BIGINT,
                references: {
                    model: 'products_required',
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

        queryInterface.addConstraint('merchants_products_required', {
            type: 'unique',
            fields: ['product_required_id', 'merchant_id'],
            name: 'fk_unique_constraint'
        });

        const productsRequired = [
            {
                name: 'Gateway',
                description: 'Lorem Ipsum'
            },
            {
                name: 'MyPay App',
                description: 'Lorem Ipsum'
            },
            {
                name: 'Virtual Terminal',
                description: 'Lorem Ipsum'
            },
            {
                name: 'MyEcomm',
                description: 'Lorem Ipsum'
            },
            {
                name: 'Card Machine',
                description: 'Lorem Ipsum'
            }
        ].map((product) => ({
            id: flakeGenerateDecimal(),
            name: product.name,
            description: product.description,
            created_at: new Date(),
            updated_at: new Date()
        }));

        await queryInterface.bulkInsert('products_required', productsRequired);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('merchants_products_required');
        await queryInterface.dropTable('products_required');
    }
};
