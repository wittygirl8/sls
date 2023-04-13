'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('merchants', 'primary_owner_id', {
            type: Sequelize.DataTypes.BIGINT,
            references: {
                model: 'owners_details',
                key: 'id'
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('merchants', 'primary_owner_id');
    }
};
