'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        let { DataTypes } = Sequelize;
        await queryInterface.createTable('dna_merchant_metadata', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            merchantId: {
                type: DataTypes.INTEGER,
                onDelete: 'CASCADE',
                allowNull: true,
                field: 'merchant_id'
            },
            terminalId: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'terminal_id'
            },
            type: {
                type: DataTypes.STRING,
                allowNull: true
            },
            rawData: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'raw_data'
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false
            },
            deleted_at: {
                type: DataTypes.DATE,
                allowNull: true
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('dna_merchant_metadata');
    }
};
