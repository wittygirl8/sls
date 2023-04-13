'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('transactions', 'channel', {
            type: Sequelize.BIGINT,
            references: {
                model: 'products_required',
                key: 'id'
            }
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('transactions', 'channel');
    }
};
