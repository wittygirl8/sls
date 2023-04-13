'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkUpdate(
            'resellers',
            { address: 'Sarnia House, Le Truchot, St Peter Port, GY1 1GR' },
            { id: 1 }
        );
        await queryInterface.bulkUpdate(
            'resellers',
            { address: 'Sarnia House, Le Truchot, St Peter Port, GY1 1GR' },
            { id: 2 }
        );
        await queryInterface.bulkUpdate(
            'resellers',
            { address: 'Sarnia House, Le Truchot, St Peter Port, GY1 1GR' },
            { id: 3 }
        );
    }
};
