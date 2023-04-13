'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('business_details', 'creation_date', {
            type: Sequelize.DATE,
            defaultValue: false,
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('business_details', 'creation_date');
    }
};
