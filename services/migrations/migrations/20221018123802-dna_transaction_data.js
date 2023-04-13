'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        let { DataTypes } = Sequelize;
        await queryInterface
            .createTable(
                'dna_transaction_data',
                {
                    id: {
                        allowNull: false,
                        autoIncrement: true,
                        primaryKey: true,
                        type: DataTypes.INTEGER
                    },
                    merchantId: {
                        type: DataTypes.STRING,
                        allowNull: false,
                        field: 'merchant_id'
                    },
                    transactionDate: {
                        type: DataTypes.DATE,
                        allowNull: true,
                        field: 'transaction_date'
                    },
                    amount: {
                        type: DataTypes.DECIMAL(8, 2),
                        allowNull: true,
                        field: 'amount'
                    },
                    transactionId: {
                        type: DataTypes.STRING,
                        allowNull: true,
                        unique: true,
                        field: 'transaction_id'
                    },
                    transactionType: {
                        type: DataTypes.STRING,
                        allowNull: true,
                        field: 'transaction_type'
                    },
                    status: {
                        type: DataTypes.STRING,
                        allowNull: true,
                        field: 'status'
                    },
                    cardScheme: {
                        type: DataTypes.STRING,
                        allowNull: true,
                        field: 'card_scheme'
                    },
                    processedAmount: {
                        type: DataTypes.INTEGER,
                        allowNull: true,
                        field: 'processed_amount'
                    },
                    type: {
                        type: DataTypes.STRING,
                        allowNull: true,
                        field: 'type'
                    },
                    paymentMethod: {
                        type: DataTypes.STRING,
                        allowNull: true,
                        field: 'payment_method'
                    },
                    payerName: {
                        type: DataTypes.STRING,
                        allowNull: true,
                        field: 'payer_name'
                    },
                    payerEmail: {
                        type: DataTypes.STRING,
                        allowNull: true,
                        field: 'payer_email'
                    },
                    payerPhone: {
                        type: DataTypes.STRING,
                        allowNull: true,
                        field: 'payer_phone'
                    },
                    description: {
                        type: DataTypes.STRING,
                        allowNull: true,
                        field: 'description'
                    },
                    created_at: {
                        type: DataTypes.DATE,
                        allowNull: true
                    },
                    updated_at: {
                        type: DataTypes.DATE,
                        allowNull: true
                    },
                    deleted_at: {
                        type: DataTypes.DATE,
                        allowNull: true
                    }
                },
                {
                    charset: 'utf8'
                }
            )
            .then(() =>
                queryInterface.addIndex('dna_transaction_data', ['merchant_id', 'transaction_date', 'transaction_id'])
            );

        queryInterface.addConstraint('dna_transaction_data', {
            type: 'unique',
            fields: ['merchant_id', 'transaction_date', 'transaction_type'],
            name: 'dna_transaction_data_unique_constraint'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('dna_transaction_data');
    }
};
