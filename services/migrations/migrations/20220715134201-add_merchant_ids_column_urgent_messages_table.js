'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('urgent_messages', 'merchant_ids', {
            type: Sequelize.DataTypes.STRING(500),
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('urgent_messages', 'merchant_ids', Sequelize.STRING);
    }
};
