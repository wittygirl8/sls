'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addIndex('users', ['email'], {
            name: 'users_email'
        });
    }
};
