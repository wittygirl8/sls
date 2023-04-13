'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        let { DataTypes } = Sequelize;

        await queryInterface.createTable('bank_details_update_requests', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            merchantId: {
                type: DataTypes.INTEGER,
                field: 'merchant_id'
            },
            sortCode: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'sort_code'
            },
            newAccountNumber: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'new_account_number'
            },
            accountHolderName: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'account_holder_name'
            },
            routingNumber: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'routing_number'
            },
            nameOfBank: {
                type: DataTypes.STRING,
                field: 'name_of_bank'
            },
            bankAddress1: {
                type: DataTypes.STRING,
                field: 'bank_address_1'
            },
            bankAddress2: {
                type: DataTypes.STRING,
                field: 'bank_address_2'
            },
            bsb: {
                type: DataTypes.STRING,
                field: 'bsb'
            },
            transitNumber: {
                type: DataTypes.STRING,
                field: 'transit_number'
            },
            financialInstitutionNumber: {
                type: DataTypes.STRING,
                field: 'financial_institution_number'
            },
            status: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'Unverified'
            },
            approvalStatus: {
                type: DataTypes.ENUM('WAITING_APPROVAL', 'APPROVED', 'REJECTED', 'DELETED'),
                field: 'approval_status'
            },
            created_at: {
                allowNull: true,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            deleted_at: {
                allowNull: true,
                type: Sequelize.DATE
            }
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('bank_details_update_requests');
    }
};
