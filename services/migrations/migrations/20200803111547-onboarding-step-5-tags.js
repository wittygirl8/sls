'use strict';
const { flakeGenerateDecimal } = require('../libs/flake.generator');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('business_descriptions', {
            id: {
                type: Sequelize.DataTypes.BIGINT,
                primaryKey: true
            },
            name: {
                type: Sequelize.DataTypes.STRING,
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

        await queryInterface.createTable('product_descriptions', {
            id: {
                type: Sequelize.DataTypes.BIGINT,
                primaryKey: true
            },
            name: {
                type: Sequelize.DataTypes.STRING,
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

        const businessDescriptions = [
            'MCC 4111 TRANSPORT-SUBURBAN & LOCAL COMMUNTER',
            'MCC 4121 limousins and Taxicabs',
            'MCC 4816 COMPUTER NETWORK/ Information services',
            'MCC 5013 Motor vehicle',
            'MCC 5065 Electrical Parts and Equitment',
            'MCC 5074 Plumbing & heating equitment',
            'MCC 5411 Grocery Stores Supermarkets',
            'MCC 5814 Fast Food Restaurants',
            'MCC 7211 Dry Cleaners',
            'MCC 5940 5940 Bicycle Shops - Sales & Service',
            'MCC 5942 Book Stores',
            'MCC 5944 Clock, Jewelry, watch and Silverware Store',
            'MCC 5945 Game, Toy and Hobby Shops',
            'MCC 5948 Leather Goods & Luggage stores',
            'MCC 5977 Cosmetic Stores'
        ].map((description) => ({
            id: flakeGenerateDecimal(),
            name: description,
            created_at: new Date(),
            updated_at: new Date()
        }));

        const productDescriptions = ['PC', 'Periperhals', 'Cars', 'Food'].map((description) => ({
            id: flakeGenerateDecimal(),
            name: description,
            created_at: new Date(),
            updated_at: new Date()
        }));

        await queryInterface.bulkInsert('business_descriptions', businessDescriptions);

        await queryInterface.bulkInsert('product_descriptions', productDescriptions);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('business_descriptions');
        await queryInterface.dropTable('product_descriptions');
    }
};
