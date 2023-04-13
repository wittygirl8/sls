'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.bulkUpdate(
                'business_descriptions',
                {
                    name: 'MCC 5940 Bicycle Shops - Sales & Services'
                },
                {
                    id: 10
                },
                { transaction }
            );
            await queryInterface.bulkUpdate(
                'business_descriptions',
                {
                    name: 'MCC 5944 Clock, Jewelry, Watch & Silverware Store'
                },
                {
                    id: 12
                },
                { transaction }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
        }
    }
};
