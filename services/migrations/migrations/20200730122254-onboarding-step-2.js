'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('business_details', {
            id: {
                type: Sequelize.DataTypes.BIGINT,
                primaryKey: true
            },
            business_type_id: {
                type: Sequelize.DataTypes.BIGINT,
                onDelete: 'CASCADE',
                allowNull: false,
                references: {
                    model: 'business_types',
                    key: 'id'
                }
            },
            registered_number: Sequelize.DataTypes.STRING,
            vat_number: Sequelize.DataTypes.STRING,
            legal_name: Sequelize.DataTypes.STRING,
            trading_name: Sequelize.DataTypes.STRING,
            phone_number: Sequelize.DataTypes.STRING,
            website_url: Sequelize.DataTypes.STRING,
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        await queryInterface.addColumn('merchants', 'business_detail_id', {
            type: Sequelize.DataTypes.BIGINT,
            references: {
                model: 'business_details',
                key: 'id'
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('merchants', 'business_detail_id');
        await queryInterface.dropTable('business_details');
    }
};
