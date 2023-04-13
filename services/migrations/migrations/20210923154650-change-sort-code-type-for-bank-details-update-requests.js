'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('bank_details_update_requests', 'sort_code', {
            type: Sequelize.DataTypes.STRING
        });
    }
};
