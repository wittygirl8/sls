'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('owners_details', {
            id: {
                type: Sequelize.DataTypes.BIGINT,
                primaryKey: true
            },
            title: Sequelize.DataTypes.STRING,
            full_name: Sequelize.DataTypes.STRING,
            nationality: Sequelize.DataTypes.STRING,
            birth_date: Sequelize.DataTypes.DATE,
            email: Sequelize.DataTypes.STRING,
            contact_phone: Sequelize.DataTypes.STRING,
            business_title: Sequelize.DataTypes.STRING,
            ownership: Sequelize.DataTypes.INTEGER,
            ownership_type: Sequelize.DataTypes.STRING,
            owner_address_id: {
                type: Sequelize.DataTypes.BIGINT,
                references: {
                    model: 'addresses',
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

        await queryInterface.createTable('merchant_owners', {
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
            owner_id: {
                type: Sequelize.DataTypes.BIGINT,
                references: {
                    model: 'owners_details',
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
        await queryInterface.dropTable('merchant_owners');
        await queryInterface.dropTable('owners_details');
    }
};
