'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        let { DataTypes } = Sequelize;

        await queryInterface.createTable('general_otp', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            merchantId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            type: DataTypes.STRING,
            email: DataTypes.STRING,
            phoneNumber: {
                type: DataTypes.STRING,
                field: 'phone_number'
            },
            value: DataTypes.STRING,
            method: {
                type: DataTypes.STRING,
                values: ['EMAIL', 'PHONE']
            },
            status: {
                type: DataTypes.ENUM,
                values: ['PENDING', 'ACCEPTED', 'CANCELLED'],
                defaultValue: 'PENDING'
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false
            },
            deleted_at: {
                type: DataTypes.DATE,
                allowNull: true
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('general_otp');
    }
};
