'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        let { DataTypes } = Sequelize;

        await queryInterface.createTable('merchant_qr', {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
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
            standardDocLink: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'standard_doc_link'
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false
            },

            updated_at: {
                type: DataTypes.DATE,
                allowNull: false
            },
            deleted_at: {
                allowNull: true,
                type: Sequelize.DATE
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('merchant_qr');
    }
};
