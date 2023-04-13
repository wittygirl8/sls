'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('merchants', 'is_receipt_enabled', {
            type: Sequelize.DataTypes.BOOLEAN,
            defaultValue: false
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('merchants', 'is_receipt_enabled');
    }
};
