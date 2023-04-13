'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        let { DataTypes } = Sequelize;
        await queryInterface.changeColumn('documents', 'status', {
            type: DataTypes.ENUM('NEED_APPROVAL', 'ACTIVE', 'REJECTED', 'DELETED', 'OLD', 'OVERRIDDEN'),
            defaultValue: 'NEED_APPROVAL',
            allowNull: false
        });
        await queryInterface.changeColumn('bank_details_update_requests', 'approval_status', {
            type: DataTypes.ENUM('WAITING_APPROVAL', 'APPROVED', 'REJECTED', 'DELETED', 'OVERRIDDEN'),
            defaultValue: 'WAITING_APPROVAL',
            allowNull: false
        });
    }
};
