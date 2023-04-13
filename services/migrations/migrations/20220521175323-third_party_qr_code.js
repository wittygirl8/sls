'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        let { DataTypes } = Sequelize;
        await queryInterface.createTable('third_party_qr_code', {
            id: {
                type: DataTypes.BIGINT,
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
            description: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'description'
            },
            link: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'link'
            },
            thirdPartyQrLink: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'third_party_qr_link'
            },
            qrCodeExpiryDate: {
                type: DataTypes.DATE,
                field: 'qr_code_expiry_date'
            },
            isQrCodeLatest: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                field: 'is_qr_code_latest'
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
        await queryInterface.dropTable('third_party_qr_code');
    }
};
