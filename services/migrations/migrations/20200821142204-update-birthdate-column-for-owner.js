'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('owners_details', 'birth_date', {
            type: Sequelize.DataTypes.STRING,
        });
    },

    down: async (queryInterface, Sequelize) => {
    }
};
