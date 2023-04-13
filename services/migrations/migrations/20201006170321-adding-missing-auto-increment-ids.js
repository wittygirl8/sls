'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`SET FOREIGN_KEY_CHECKS=0;`, { raw: true });
    await queryInterface.sequelize.query(`ALTER TABLE users MODIFY id INT NOT NULL AUTO_INCREMENT`, { raw: true });
    await queryInterface.sequelize.query(`SET FOREIGN_KEY_CHECKS=1;`, { raw: true });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`SET FOREIGN_KEY_CHECKS=0;`, { raw: true });
    await queryInterface.sequelize.query(`ALTER TABLE users MODIFY id INT NOT NULL`, { raw: true });
    await queryInterface.sequelize.query(`SET FOREIGN_KEY_CHECKS=1;`, { raw: true });
  }
};
