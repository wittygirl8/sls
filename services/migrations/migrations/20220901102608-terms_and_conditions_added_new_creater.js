'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        let { DataTypes } = Sequelize;

        await queryInterface.changeColumn('terms_and_conditions', 'creator', {
            type: DataTypes.ENUM('canonical_reseller', 'card_stream', 'reseller', 'acquirer', 'acquirer_agreement'),
            allowNull: false
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('terms_and_conditions', 'creator');
    }
};
