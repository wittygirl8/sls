'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        let { DataTypes } = Sequelize;

        await queryInterface.createTable('canonical_resellers', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            resellerId: {
                type: DataTypes.INTEGER,
                field: 'reseller_id'
            },
            companyAddressId: {
                type: DataTypes.INTEGER,
                field: 'company_address_id'
            },
            primaryContactName: {
                type: DataTypes.STRING,
                field: 'primary_contact_name'
            },
            primaryContactEmail: {
                type: DataTypes.STRING,
                field: 'primary_contact_email'
            },
            telNumber: {
                type: DataTypes.STRING,
                field: 'tel_number'
            },
            companyName: {
                type: DataTypes.STRING,
                field: 'company_name'
            },
            companyNumber: {
                type: DataTypes.STRING,
                field: 'company_number'
            },
            companyType: {
                type: DataTypes.STRING,
                field: 'company_type'
            },
            orderNumber: {
                type: DataTypes.STRING,
                field: 'order_number'
            },
            orderDate: {
                type: DataTypes.DATE,
                field: 'order_date'
            },
            commencementDate: {
                type: DataTypes.DATE,
                field: 'commencement_date'
            },
            initialTerm: {
                type: DataTypes.INTEGER,
                field: 'initial_term'
            },
            serviceCharge: {
                type: DataTypes.DECIMAL(7, 2),
                field: 'service_charge'
            },
            fixedCharge: {
                type: DataTypes.DECIMAL(7, 2),
                field: 'fixed_charge'
            },
            merchantSetupCharge: {
                type: DataTypes.DECIMAL(7, 2),
                field: 'merchant_setup_charge'
            },
            ratePerTransaction: {
                type: DataTypes.DECIMAL(7, 2),
                field: 'rate_per_transaction'
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

        await queryInterface.addColumn('merchants', 'canonical_reseller_id', {
            type: DataTypes.INTEGER,
            references: {
                model: 'canonical_resellers',
                key: 'id'
            }
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('merchants', 'canonical_reseller_id');
        await queryInterface.dropTable('resellers');
    }
};
