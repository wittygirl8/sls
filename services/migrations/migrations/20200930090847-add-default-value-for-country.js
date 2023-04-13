'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.bulkUpdate(
                'merchants',
                {
                    country: 'United Kingdom'
                },
                {
                    country: { [Sequelize.Op.is]: null }
                },
                { transaction }
            );

            await queryInterface.changeColumn(
                'merchants',
                'country',
                {
                    type: Sequelize.DataTypes.STRING,
                    allowNull: false,
                    defaultValue: 'United Kingdom'
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
            await queryInterface.changeColumn(
                'merchants',
                'country',
                {
                    type: Sequelize.DataTypes.STRING,
                    allowNull: true
                },
                { transaction }
            );
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
        }
    }
};
