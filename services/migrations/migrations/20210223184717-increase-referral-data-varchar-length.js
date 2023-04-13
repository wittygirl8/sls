'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('referral_data', 'referral_data', {
            type: Sequelize.DataTypes.STRING(5120) //5kb
        });
    }
};
