'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        let { DataTypes } = Sequelize;
        await queryInterface.createTable(
            'qr_codes',
            {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: DataTypes.INTEGER
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
                    type: DataTypes.STRING(2048),
                    allowNull: true,
                    field: 'link'
                },
                qrImgLink: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    field: 'img_link'
                },
                qrCodeExpiryDate: {
                    type: DataTypes.DATE,
                    allowNull: true,
                    field: 'expiry_date'
                },
                qrName: {
                    type: DataTypes.STRING,
                    allowNull: true,
                    field: 'name'
                },
                qrUUID: {
                    type: Sequelize.DataTypes.UUID,
                    defaultValue: Sequelize.DataTypes.UUIDV4,
                    unique: true,
                    field: 'uuid'
                },
                amount: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    field: 'amount'
                },
                typeOfQr: {
                    type: DataTypes.ENUM('payment', 'generic'),
                    allowNull: false,
                    field: 'type'
                },
                status: {
                    type: DataTypes.ENUM('Active', 'Expired', 'Closed'),
                    allowNull: false,
                    field: 'status'
                },
                reason: {
                    type: DataTypes.STRING,
                    allowNull: true,
                    field: 'reason_to_close'
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
            },
            {
                initialAutoIncrement: 654321,
                charset: 'utf8'
            }
        );
        await queryInterface.dropTable('third_party_qr_code');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('qr_codes');
    }
};
