'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.bulkInsert(
                'acquirers',
                [
                    {
                        id: 1,
                        name: 'Cashflows',
                        created_at: new Date(),
                        updated_at: new Date()
                    },
                    {
                        id: 2,
                        name: 'Evo',
                        created_at: new Date(),
                        updated_at: new Date()
                    },
                    {
                        id: 3,
                        name: 'First Data',
                        created_at: new Date(),
                        updated_at: new Date()
                    },
                    {
                        id: 4,
                        name: 'Worldpay',
                        created_at: new Date(),
                        updated_at: new Date()
                    },
                    {
                        id: 5,
                        name: 'Creodrax',
                        created_at: new Date(),
                        updated_at: new Date()
                    },
                    {
                        id: 6,
                        name: 'Paysafe',
                        created_at: new Date(),
                        updated_at: new Date()
                    },
                    {
                        id: 7,
                        name: 'Trust',
                        created_at: new Date(),
                        updated_at: new Date()
                    },
                    {
                        id: 8,
                        name: 'AIB',
                        created_at: new Date(),
                        updated_at: new Date()
                    },
                    {
                        id: 9,
                        name: 'Decta',
                        created_at: new Date(),
                        updated_at: new Date()
                    },
                    {
                        id: 10,
                        name: 'E-Merchant Pay',
                        created_at: new Date(),
                        updated_at: new Date()
                    },
                    {
                        id: 11,
                        name: 'Truevo',
                        created_at: new Date(),
                        updated_at: new Date()
                    },
                    {
                        id: 12,
                        name: 'Barclays',
                        created_at: new Date(),
                        updated_at: new Date()
                    }
                ],
                { transaction: transaction }
            );

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
        }
    }
};
