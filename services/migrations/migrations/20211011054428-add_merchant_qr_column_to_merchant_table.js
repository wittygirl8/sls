'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        let { DataTypes } = Sequelize;
        await queryInterface.addColumn('merchants', 'merchant_qr_id', {
            type: DataTypes.UUID,
            unique: true,
            foreignKey: true,
            references: {
                model: 'merchant_qr',
                key: 'id'
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('merchants', 'merchant_qr_id');
    }
};
