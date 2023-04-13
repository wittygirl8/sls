'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        let { DataTypes } = Sequelize;
        await queryInterface.addColumn('documents', 'status', {
            type: DataTypes.ENUM('NEED_APPROVAL', 'ACTIVE', 'REJECTED', 'DELETED', 'OLD'),
            defaultValue: 'NEED_APPROVAL',
            allowNull: false
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('documents', 'status');
    }
};
