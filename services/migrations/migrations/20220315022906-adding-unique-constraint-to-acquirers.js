'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        queryInterface.addConstraint('acquirers', {
            type: 'unique',
            fields: ['name'],
            name: 'acquirer_unique_constraint'
        });
    },

    async down(queryInterface, Sequelize) {
        queryInterface.removeConstraint('acquirers', 'acquirer_unique_constraint');
    }
};
