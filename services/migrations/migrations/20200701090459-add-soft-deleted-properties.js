'use strict';

module.exports = {
    /**
     * @param {QueryInterface} queryInterface
     * @param {Sequelize} Sequelize
     */
    up: async (queryInterface, Sequelize) => {
        return queryInterface
            .addColumn('Businesses', 'deletedAt', { type: Sequelize.DATE })
            .then(() =>
                queryInterface
                    .addColumn('Clients', 'deletedAt', { type: Sequelize.DATE })
                    .then(() =>
                        queryInterface
                            .addColumn('Merchants', 'deletedAt', { type: Sequelize.DATE })
                            .then(() =>
                                queryInterface.addColumn('Relationships', 'deletedAt', { type: Sequelize.DATE })
                            )
                    )
            );
    },

    down: async (queryInterface, Sequelize) => {
        return queryInterface
            .removeColumn('Businesses', 'deletedAt')
            .then(() =>
                queryInterface
                    .removeColumn('Clients', 'deletedAt')
                    .then(() =>
                        queryInterface
                            .removeColumn('Merchants', 'deletedAt')
                            .then(() => queryInterface.removeColumn('Relationships', 'deletedAt'))
                    )
            );
    },
};
