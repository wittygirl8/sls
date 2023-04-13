'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query("UPDATE products_required SET name='MyMoto App' WHERE name='MyPay App'");
    },
    down: async (queryInterface, Sequelize) => {}
};
