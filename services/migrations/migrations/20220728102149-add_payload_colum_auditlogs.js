'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('audit_log_item', 'primary_key', {
            type: Sequelize.DataTypes.STRING,
            allowNull: true
        });
        await queryInterface.addColumn('audit_log_item', 'table_name', {
            type: Sequelize.DataTypes.STRING,
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('audit_log_item', 'primary_key', Sequelize.STRING);
        await queryInterface.removeColumn('audit_log_item', 'table_name', Sequelize.STRING);
    }
};
