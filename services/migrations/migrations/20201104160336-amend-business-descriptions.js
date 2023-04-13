'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.bulkUpdate(
                'business_descriptions',
                {
                    name: 'MCC 4111 Transport-Suburban & Local Commuter'
                },
                {
                    id: 1
                },
                { transaction }
            );
            await queryInterface.bulkUpdate(
                'business_descriptions',
                {
                    name: 'MCC 4121 Limousine & Taxicabs'
                },
                {
                    id: 2
                },
                { transaction }
            );
            await queryInterface.bulkUpdate(
                'business_descriptions',
                {
                    name: 'MCC 4816 Computer Network/ Information Services'
                },
                {
                    id: 3
                },
                { transaction }
            );
            await queryInterface.bulkUpdate(
                'business_descriptions',
                {
                    name: 'MCC 5013 Motor Vehicle'
                },
                {
                    id: 4
                },
                { transaction }
            );
            await queryInterface.bulkUpdate(
                'business_descriptions',
                {
                    name: 'MCC 5065 Electrical Parts & Equipment '
                },
                {
                    id: 5
                },
                { transaction }
            );
            await queryInterface.bulkUpdate(
                'business_descriptions',
                {
                    name: 'MCC 5074 Plumbing & Heating Equipment'
                },
                {
                    id: 6
                },
                { transaction }
            );
            await queryInterface.bulkUpdate(
                'business_descriptions',
                {
                    name: 'MCC 5944 Clock, Jewellery, Watch & Silverware Store'
                },
                {
                    id: 12
                },
                { transaction }
            );
            await queryInterface.bulkUpdate(
                'business_descriptions',
                {
                    name: 'MCC 5945 Game, Toy & Hobby Shops  '
                },
                {
                    id: 13
                },
                { transaction }
            );

            await queryInterface.bulkUpdate(
                'business_descriptions',
                {
                    name: 'MCC 5948 Leather Goods & Luggage Stores'
                },
                {
                    id: 14
                },
                { transaction }
            );
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
        }
    }
};
