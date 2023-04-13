'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        let { DataTypes } = Sequelize;

        await queryInterface
            .createTable(
                'audit_log_group',
                {
                    id: {
                        type: DataTypes.INTEGER,
                        primaryKey: true,
                        autoIncrement: true
                    },
                    userId: {
                        type: DataTypes.INTEGER,
                        onDelete: 'CASCADE',
                        allowNull: false,
                        references: {
                            model: 'users',
                            key: 'id'
                        },
                        field: 'user_id'
                    },
                    merchantId: {
                        type: DataTypes.INTEGER,
                        onDelete: 'CASCADE',
                        allowNull: false,
                        references: {
                            model: 'merchants',
                            key: 'id'
                        },
                        field: 'merchant_id'
                    },
                    userAgent: {
                        type: DataTypes.STRING,
                        allowNull: true,
                        field: 'user_agent'
                    },
                    ipAddress: {
                        type: DataTypes.STRING(50),
                        allowNull: true,
                        field: 'ip_address'
                    },
                    lambadaFunction: {
                        type: DataTypes.STRING(80),
                        allowNull: false,
                        field: 'lambada_function'
                    },
                    created_at: {
                        type: DataTypes.DATE,
                        allowNull: false
                    }
                },
                { charset: 'utf8' }
            )
            .then(() => queryInterface.addIndex('audit_log_group', ['user_id', 'merchant_id']));
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('audit_log_group');
    }
};
