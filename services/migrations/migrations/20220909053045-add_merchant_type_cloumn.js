'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('merchants', 'merchant_type', {
            type: Sequelize.DataTypes.STRING(50),
            allowNull: true,
            default: null
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('merchants', 'merchant_type');
    }
};
