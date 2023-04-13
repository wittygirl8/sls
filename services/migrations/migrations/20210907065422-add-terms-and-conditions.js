'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        let { DataTypes } = Sequelize;

        await queryInterface.createTable('terms_and_conditions', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            link: {
                type: DataTypes.STRING,
                field: 'link'
            },
            linkType: {
                type: DataTypes.ENUM('pdf'),
                field: 'link_type'
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
            canonicalResellerId: {
                type: DataTypes.INTEGER,
                field: 'canonical_reseller_id'
            },
            creator: {
                type: DataTypes.ENUM('canonical_reseller', 'card_stream', 'reseller'),
                field: 'creator'
            },
            resellerId: {
                type: DataTypes.INTEGER,
                field: 'reseller_id'
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
        await queryInterface.dropTable('terms_and_conditions');
    }
};
