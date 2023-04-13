'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('urgent_messages', {
            id: {
                type: Sequelize.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            reseller_id: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'resellers',
                    key: 'id'
                }
            },
            subject: {
                type: Sequelize.STRING
            },
            message: {
                type: Sequelize.STRING,
                allowNull: false
            },
            start_date: {
                type: Sequelize.DATE,
                allowNull: false
            },
            end_date: {
                type: Sequelize.DATE,
                allowNull: false
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('urgent_messages');
    }
};
