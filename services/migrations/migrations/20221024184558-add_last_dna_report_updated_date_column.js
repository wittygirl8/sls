'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('acquirer_account_configuration', 'last_dna_ecom_report_updated_date', {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
            default: null
        });
        await queryInterface.addColumn('acquirer_account_configuration', 'last_dna_pos_report_updated_date', {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
            default: null
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('acquirer_account_configuration', 'last_dna_ecom_report_updated_date');
        await queryInterface.removeColumn('acquirer_account_configuration', 'last_dna_pos_report_updated_date');
    }
};
