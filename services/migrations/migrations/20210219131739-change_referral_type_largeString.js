'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('referral_data', 'referral_data', {
            type: Sequelize.DataTypes.STRING(1234)
        });
    },

    down: async (queryInterface, Sequelize) => {}
};
