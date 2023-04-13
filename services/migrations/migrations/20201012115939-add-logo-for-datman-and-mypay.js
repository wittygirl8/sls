'use strict';

module.exports = {
    up: async (queryInterface) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.bulkUpdate(
                'resellers',
                {
                    logo: 'https://logos-general.s3-eu-west-1.amazonaws.com/resellers-logos/mypay.png'
                },
                {
                    id: 1
                },
                { transaction }
            );
            await queryInterface.bulkUpdate(
                'resellers',
                {
                    logo: 'https://logos-general.s3-eu-west-1.amazonaws.com/resellers-logos/datman.png'
                },
                {
                    id: 2
                },
                { transaction }
            );

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            console.log(err);
        }
    },
    down: async (queryInterface, Sequelize) => {}
};
