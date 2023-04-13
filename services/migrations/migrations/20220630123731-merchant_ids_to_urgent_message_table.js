'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('urgent_messages', 'merchant_id', {
            type: Sequelize.DataTypes.STRING,
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('urgent_messages', 'merchant_id');
    }
};
