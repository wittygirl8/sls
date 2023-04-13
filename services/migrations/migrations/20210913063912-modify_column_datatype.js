'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        let { DataTypes } = Sequelize;

        await queryInterface.changeColumn('terms_and_conditions', 'id', {
            type: DataTypes.STRING
        });

        await queryInterface.changeColumn('terms_and_conditions_map', 'tc_id', {
            type: DataTypes.STRING
        });
    },

    down: async (queryInterface) => {
        await queryInterface.changeColumn('terms_and_conditions', 'id');
        await queryInterface.changeColumn('terms_and_conditions_map', 'tc_id');
    }
};
