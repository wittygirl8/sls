'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        //Business
        await queryInterface.renameTable('Businesses', 'businesses');
        await queryInterface.renameColumn('businesses', 'createdAt', 'created_at');
        await queryInterface.renameColumn('businesses', 'updatedAt', 'updated_at');
        await queryInterface.renameColumn('businesses', 'deletedAt', 'deleted_at');
        //Clients
        await queryInterface.renameTable('Clients', 'clients');
        await queryInterface.renameColumn('clients', 'businessId', 'business_id');
        await queryInterface.renameColumn('clients', 'createdAt', 'created_at');
        await queryInterface.renameColumn('clients', 'updatedAt', 'updated_at');
        await queryInterface.renameColumn('clients', 'deletedAt', 'deleted_at');
        //Merchants
        await queryInterface.renameTable('Merchants', 'merchants');
        await queryInterface.renameColumn('merchants', 'businessId', 'business_id');
        await queryInterface.renameColumn('merchants', 'clientId', 'client_id');
        await queryInterface.renameColumn('merchants', 'createdAt', 'created_at');
        await queryInterface.renameColumn('merchants', 'updatedAt', 'updated_at');
        await queryInterface.renameColumn('merchants', 'deletedAt', 'deleted_at');
        //Roles
        await queryInterface.renameTable('Roles', 'roles');
        await queryInterface.renameColumn('roles', 'createdAt', 'created_at');
        await queryInterface.renameColumn('roles', 'updatedAt', 'updated_at');
        //Users
        await queryInterface.renameTable('Users', 'users');
        await queryInterface.renameColumn('users', 'firstName', 'first_name');
        await queryInterface.renameColumn('users', 'lastName', 'last_name');
        await queryInterface.renameColumn('users', 'pictureUrl', 'picture_url');
        await queryInterface.renameColumn('users', 'isDisable', 'is_disable');
        await queryInterface.renameColumn('users', 'isDeleted', 'is_deleted');
        await queryInterface.renameColumn('users', 'createdBy', 'created_by');
        await queryInterface.renameColumn('users', 'typeId', 'type_id');
        await queryInterface.renameColumn('users', 'refreshToken', 'refresh_token');
        await queryInterface.renameColumn('users', 'createdAt', 'created_at');
        await queryInterface.renameColumn('users', 'updatedAt', 'updated_at');
        //Relationships
        await queryInterface.renameTable('Relationships', 'relationships');
        await queryInterface.renameColumn('relationships', 'businessId', 'business_id');
        await queryInterface.renameColumn('relationships', 'clientId', 'client_id');
        await queryInterface.renameColumn('relationships', 'merchantId', 'merchant_id');
        await queryInterface.renameColumn('relationships', 'userId', 'user_id');
        await queryInterface.renameColumn('relationships', 'roleId', 'role_id');
        await queryInterface.renameColumn('relationships', 'createdAt', 'created_at');
        await queryInterface.renameColumn('relationships', 'updatedAt', 'updated_at');
        await queryInterface.renameColumn('relationships', 'deletedAt', 'deleted_at');
        // IdentityProviderMyPayRelations
        await queryInterface.renameColumn('identity_provider_mypay_relations', 'userId', 'user_id');
        await queryInterface.renameColumn('identity_provider_mypay_relations', 'providerId', 'provider_id');
        await queryInterface.renameColumn('identity_provider_mypay_relations', 'providerName', 'provider_name');
        await queryInterface.renameColumn('identity_provider_mypay_relations', 'isActive', 'is_active');
        await queryInterface.renameColumn('identity_provider_mypay_relations', 'createdAt', 'created_at');
        await queryInterface.renameColumn('identity_provider_mypay_relations', 'updatedAt', 'updated_at');
        // UserTypes
        await queryInterface.renameColumn('user_types', 'createdAt', 'created_at');
        await queryInterface.renameColumn('user_types', 'updatedAt', 'updated_at');
    },

    down: async (queryInterface, Sequelize) => {
        //Business
        await queryInterface.renameTable('businesses', 'Businesses');
        await queryInterface.renameColumn('businesses', 'created_at', 'createdAt');
        await queryInterface.renameColumn('businesses', 'updated_at', 'updatedAt');
        await queryInterface.renameColumn('businesses', 'deleted_at', 'deletedAt');
        //Clients
        await queryInterface.renameTable('clients', 'Clients');
        await queryInterface.renameColumn('Clients', 'business_id', 'businessId');
        await queryInterface.renameColumn('clients', 'created_at', 'createdAt');
        await queryInterface.renameColumn('clients', 'updated_at', 'updatedAt');
        await queryInterface.renameColumn('clients', 'deleted_at', 'deletedAt');
        //Merchants
        await queryInterface.renameTable('merchants', 'Merchants');
        await queryInterface.renameColumn('Merchants', 'business_id', 'businessId');
        await queryInterface.renameColumn('Merchants', 'client_id', 'clientId');
        await queryInterface.renameColumn('merchants', 'created_at', 'createdAt');
        await queryInterface.renameColumn('merchants', 'updated_at', 'updatedAt');
        await queryInterface.renameColumn('merchants', 'deleted_at', 'deletedAt');
        //Roles
        await queryInterface.renameTable('roles', 'Roles');
        await queryInterface.renameColumn('roles', 'created_at', 'createdAt');
        await queryInterface.renameColumn('roles', 'updated_at', 'updatedAt');
        //Users
        await queryInterface.renameTable('users', 'Users');
        await queryInterface.renameColumn('Users', 'first_name', 'firstName');
        await queryInterface.renameColumn('Users', 'last_name', 'lastName');
        await queryInterface.renameColumn('Users', 'picture_url', 'pictureUrl');
        await queryInterface.renameColumn('Users', 'is_disable', 'isDisable');
        await queryInterface.renameColumn('Users', 'is_deleted', 'isDeleted');
        await queryInterface.renameColumn('Users', 'created_by', 'createdBy');
        await queryInterface.renameColumn('Users', 'type_id', 'typeId');
        await queryInterface.renameColumn('Users', 'refresh_token', 'refreshToken');
        await queryInterface.renameColumn('users', 'created_at', 'createdAt');
        await queryInterface.renameColumn('users', 'updated_at', 'updatedAt');
        //Relationships
        await queryInterface.renameTable('relationships', 'Relationships');
        await queryInterface.renameColumn('Relationships', 'business_id', 'businessId');
        await queryInterface.renameColumn('Relationships', 'client_id', 'clientId');
        await queryInterface.renameColumn('Relationships', 'merchant_id', 'merchantId');
        await queryInterface.renameColumn('Relationships', 'user_id', 'userId');
        await queryInterface.renameColumn('Relationships', 'role_id', 'roleId');
        await queryInterface.renameColumn('relationships', 'created_at', 'createdAt');
        await queryInterface.renameColumn('relationships', 'updated_at', 'updatedAt');
        await queryInterface.renameColumn('relationships', 'deleted_at', 'deletedAt');
        // IdentityProviderMyPayRelations
        await queryInterface.renameColumn('identity_provider_mypay_relations', 'user_id', 'userId');
        await queryInterface.renameColumn('identity_provider_mypay_relations', 'provider_id', 'providerId');
        await queryInterface.renameColumn('identity_provider_mypay_relations', 'provider_name', 'providerName');
        await queryInterface.renameColumn('identity_provider_mypay_relations', 'is_active', 'isActive');
        await queryInterface.renameColumn('identity_provider_mypay_relations', 'created_at', 'createdAt');
        await queryInterface.renameColumn('identity_provider_mypay_relations', 'updated_at', 'updatedAt');
        // UserTypes
        await queryInterface.renameColumn('user_types', 'created_at', 'createdAt');
        await queryInterface.renameColumn('user_types', 'updated_at', 'updatedAt');
    },
};
