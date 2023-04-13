'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.addColumn(
                'resellers',
                'email',
                {
                    type: Sequelize.DataTypes.STRING,
                    allowNull: true
                },
                { transaction }
            );

            await queryInterface.bulkUpdate(
                'resellers',
                {
                    email: 'reseller@mypay.co.uk'
                },
                {
                    id: 1
                },
                { transaction }
            );

            await queryInterface.bulkUpdate(
                'resellers',
                {
                    email: 'reseller@t2s.co.uk'
                },
                {
                    id: 2
                },
                { transaction }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.removeColumn('resellers', 'email', { transaction });
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
        }
    }
};
