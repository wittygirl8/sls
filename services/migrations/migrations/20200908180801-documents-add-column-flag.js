'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('documents', 'flag', {
            type: Sequelize.DataTypes.STRING
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('documents', 'flag');
    }
};
