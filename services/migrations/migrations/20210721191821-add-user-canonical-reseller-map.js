'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        let { DataTypes } = Sequelize;

        await queryInterface.createTable('user_canonical_reseller_map', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            userId: {
                type: DataTypes.INTEGER,
                field: 'user_id'
            },
            resellerId: {
                type: DataTypes.INTEGER,
                field: 'reseller_id'
            },
            canonicalResellerId: {
                type: DataTypes.INTEGER,
                field: 'canonical_reseller_id'
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
        await queryInterface.dropTable('user_canonical_reseller_map');
    }
};
