'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('merchants', 'onboard_request', {
            type: Sequelize.DataTypes.STRING
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('merchants', 'onboard_request');
    }
};
