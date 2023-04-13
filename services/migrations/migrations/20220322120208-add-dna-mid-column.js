'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('acquirer_account_configuration', 'dna_mid', {
            type: Sequelize.DataTypes.STRING,
            allowNull: true
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('acquirer_account_configuration', 'dna_mid');
    }
};
