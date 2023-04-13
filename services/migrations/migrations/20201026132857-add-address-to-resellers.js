'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkUpdate(
            'resellers',
            { address: 'SARNIA HOUSE, LE TRUCHOT, ST PETERS PORT, GY1 1GR' },
            { id: 1 }
        );
        await queryInterface.bulkUpdate(
            'resellers',
            { address: 'Sarnia House Le TruchotSt Peter Port GY1 1GR' },
            { id: 2 }
        );
        await queryInterface.bulkUpdate(
            'resellers',
            { address: 'Sarnia House Le TruchotSt Peter Port GY1 1GR' },
            { id: 3 }
        );
    }
};
