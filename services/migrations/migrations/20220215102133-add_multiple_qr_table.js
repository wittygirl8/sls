'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        let { DataTypes } = Sequelize;

        await queryInterface.createTable('qr_payment_urls', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            uuid: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                unique: true
            },
            merchantId: {
                type: DataTypes.INTEGER,
                onDelete: 'CASCADE',
                allowNull: true,
                field: 'merchant_id'
            },
            baseURL: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'base_url'
            },
            status: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'inactive'
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
        await queryInterface.dropTable('qr_payment_urls');
    }
};
