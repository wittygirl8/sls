'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.bulkUpdate(
                'resellers',
                { support_email: 'wecare@mypay.co.uk' },
                { id: 1 },
                { transaction }
            );

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
        }
    }
};
