'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.renameTable('User-Types', 'UserTypes');
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.renameTable('UserTypes', 'User-Types');
    },
};
