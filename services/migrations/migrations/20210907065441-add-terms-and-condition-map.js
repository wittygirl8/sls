'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        let { DataTypes } = Sequelize;

        await queryInterface.createTable('terms_and_conditions_map', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            tcId: {
                type: DataTypes.INTEGER,
                field: 'tc_id'
            },
            signedBy: {
                type: DataTypes.INTEGER,
                field: 'signed_by'
            },
            activatedAt: {
                type: DataTypes.DATE,
                field: 'activated_at'
            },
            deactivatedAt: {
                type: DataTypes.DATE,
                field: 'deactivated_at'
            },
            status: {
                type: DataTypes.ENUM('pending', 'active', 'inactive'),
                field: 'status',
                allowNull: false,
                defaultValue: 'pending'
            },
            signerIp: {
                type: DataTypes.STRING,
                field: 'signer_ip'
            },
            merchantId: {
                type: DataTypes.INTEGER,
                field: 'merchant_id'
            },
            canonicalResellerId: {
                type: DataTypes.INTEGER,
                field: 'canonical_reseller_id'
            },
            belongsTo: {
                type: DataTypes.ENUM('canonical_reseller', 'merchant'),
                field: 'belongs_to'
            },
            created_at: {
                allowNull: true,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            deleted_at: {
                allowNull: true,
                type: Sequelize.DATE
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('terms_and_conditions_map');
    }
};
