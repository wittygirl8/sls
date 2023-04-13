'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('terms_and_conditions_map', 'user_agent_info', {
            type: Sequelize.DataTypes.STRING
        });
        await queryInterface.addColumn('terms_and_conditions_map', 'checksum', {
            type: Sequelize.DataTypes.STRING
        });
        await queryInterface.addColumn('acquirer_account_configuration', 'dna_application_Id', {
            type: Sequelize.DataTypes.STRING
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('terms_and_conditions_map', 'user_agent_info');
        await queryInterface.removeColumn('terms_and_conditions_map', 'checksum');
        await queryInterface.removeColumn('acquirer_account_configuration', 'dna_application_Id');
    }
};
