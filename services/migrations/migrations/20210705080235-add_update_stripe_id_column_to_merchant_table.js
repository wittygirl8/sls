'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('merchants', 'stripe_id_updated', {
            type: Sequelize.DataTypes.BOOLEAN,
            defaultValue: false
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('merchants', 'stripe_id_updated');
    }
};
