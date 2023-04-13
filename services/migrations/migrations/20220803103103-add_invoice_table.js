'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        let { DataTypes } = Sequelize;
        await queryInterface.createTable('invoices', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            merchantId: {
                type: DataTypes.INTEGER,
                onDelete: 'CASCADE',
                allowNull: false,
                references: {
                    model: 'merchants',
                    key: 'id'
                },
                field: 'merchant_id'
            },
            amount: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    min: 0
                }
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'description'
            },
            firstName: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'first_name'
            },
            lastName: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'last_name'
            },
            email: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'email'
            },
            phone: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'phone'
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'quantity',
                validate: {
                    min: 1
                }
            },
            item: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'item'
            },
            dateOfExpiry: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'date_of_expiry'
            },
            supply_date: {
                type: DataTypes.DATE,
                allowNull: false
            },
            receiptEmail: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'receipt_email'
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: true
            },
            deleted_at: {
                type: DataTypes.DATE,
                allowNull: true
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: true
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('invoices');
    }
};
