'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('terms_and_conditions', 'acquirer_id', {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('terms_and_conditions', 'acquirer_id');
    }
};
