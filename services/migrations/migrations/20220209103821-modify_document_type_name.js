'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        await queryInterface.bulkUpdate(
            'document_types',
            {
                name: 'Proof of ID frontside'
            },
            { id: 9 },
            { transaction }
        );
        await queryInterface.bulkUpdate(
            'document_types',
            {
                name: 'Proof of ID backside'
            },
            { id: 10 },
            { transaction }
        );
        await queryInterface.bulkUpdate(
            'document_types',
            {
                name: 'Business registration certificate'
            },
            { id: 11 },
            { transaction }
        );

        await transaction.commit();
    }
};
