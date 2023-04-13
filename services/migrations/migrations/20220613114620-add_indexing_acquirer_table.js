'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addIndex('acquirer_account_configuration', ['merchant_id'], {
            name: 'merchant_id'
        });
        await queryInterface.addConstraint('acquirer_account_configuration', {
            fields: ['merchant_id'],
            type: 'foreign key',
            references: {
                table: 'merchants',
                field: 'id'
            }
        });
    }
};
