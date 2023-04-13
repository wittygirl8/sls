'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface
            .changeColumn('dna_transaction_data', 'amount', { type: Sequelize.DataTypes.INTEGER(11), allowNull: false })
            .then(() => queryInterface.renameColumn('dna_transaction_data', 'amount', 'transaction_amount'));
    }
};
