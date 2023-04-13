'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('users', 'picture_url', { type: Sequelize.STRING(1024) });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('users', 'picture_url', { type: Sequelize.STRING(255) });
    }
};
