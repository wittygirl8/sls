'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('users', 'resent_invite_at', {
            type: Sequelize.DATE,
            defaultValue: null
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('users', 'resent_invite_at');
    }
};
