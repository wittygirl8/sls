'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('Users', 'createdBy', Sequelize.STRING);
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('Users', 'createdBy', Sequelize.STRING);
    },
};
