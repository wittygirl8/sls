'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('merchants', 'is_invoice_enabled', {
            type: Sequelize.DataTypes.BOOLEAN,
            defaultValue: false
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('merchants', 'is_invoice_enabled');
    }
};
