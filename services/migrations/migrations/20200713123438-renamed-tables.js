'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    
    return queryInterface.renameTable('UserTypes', 'user_types')
            .then(() => {
              queryInterface.renameTable('IdentityProviderMyPayRelations', '`identity_provider_mypay_relations`')
            })
  },

  down: async (queryInterface, Sequelize) => {
    
    return queryInterface.renameTable('user_types', 'UserTypes')
            .then(() => {
              queryInterface.renameTable('identity_provider_mypay_relations', 'IdentityProviderMyPayRelations');
            });
  }
};
