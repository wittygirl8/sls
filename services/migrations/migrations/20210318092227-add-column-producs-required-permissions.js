'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('merchants_products_required', 'status', {
            type: Sequelize.DataTypes.ENUM('ADDITION-PENDING', 'DELETION-PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED'),
            allowNull: false,
            defaultValue: 'ACTIVE'
        });
        await queryInterface.addColumn('merchants_products_required', 'additional_info', {
            type: Sequelize.DataTypes.STRING(5120),
            allowNull: true
        });
    }
};
