'use strict';
const { flakeGenerateDecimal } = require('../libs/flake.generator');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.createTable(
                'withdrawal_status',
                {
                    id: {
                        type: Sequelize.INTEGER,
                        primaryKey: true
                    },
                    name: {
                        type: Sequelize.STRING,
                        allowNull: false
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

            const withdrawalStatuses = ['Pending', 'Sent', 'Not Received', 'Cancelled'].map((name, index) => ({
                id: index + 1,
                name: name,
                created_at: new Date(),
                updated_at: new Date()
            }));

            await queryInterface.bulkInsert('withdrawal_status', withdrawalStatuses);

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
        }
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('withdrawal_status');
    }
};
