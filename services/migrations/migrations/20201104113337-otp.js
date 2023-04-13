'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.createTable(
                'auth_otp',
                {
                    id: {
                        type: Sequelize.INTEGER,
                        primaryKey: true,
                        autoIncrement: true
                    },
                    email: {
                        type: Sequelize.STRING
                    },
                    phone: {
                        type: Sequelize.STRING
                    },
                    method: {
                        type: Sequelize.INTEGER
                    },
                    hash: {
                        type: Sequelize.STRING
                    },
                    issue_time: {
                        type: Sequelize.DATE,
                        allowNull: true
                    },
                    created_at: {
                        type: Sequelize.DATE,
                        allowNull: false
                    },
                    updated_at: {
                        type: Sequelize.DATE,
                        allowNull: false
                    }
                },
                { transaction: transaction }
            );

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.dropTable('auth_otp');

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
        }
    }
};
