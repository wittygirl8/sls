'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        let { DataTypes } = Sequelize;

        await queryInterface
            .createTable(
                'audit_log_item',
                {
                    id: {
                        type: DataTypes.INTEGER,
                        primaryKey: true,
                        autoIncrement: true
                    },
                    logId: {
                        type: DataTypes.INTEGER,
                        onDelete: 'CASCADE',
                        allowNull: false,
                        references: {
                            model: 'audit_log_group',
                            key: 'id'
                        },
                        field: 'log_id'
                    },
                    fieldModified: {
                        type: DataTypes.STRING(30),
                        allowNull: true,
                        field: 'field_modified'
                    },
                    currentValue: {
                        type: DataTypes.STRING,
                        allowNull: true,
                        field: 'current_value'
                    },
                    newValue: {
                        type: DataTypes.STRING,
                        allowNull: true,
                        field: 'new_value'
                    },
                    created_at: {
                        type: DataTypes.DATE,
                        allowNull: false
                    }
                },
                { charset: 'utf8' }
            )
            .then(() => queryInterface.addIndex('audit_log_item', ['log_id']));
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('audit_log_item');
    }
};
