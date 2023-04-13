'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const database = process.env.INFRA_STAGE ? process.env.INFRA_STAGE + '_database' : 'my_pay';
        const transaction = await queryInterface.sequelize.transaction();

        console.log('datab', database);

        try {
            await queryInterface.sequelize.query('DROP DATABASE IF EXISTS ' + database + ';', {
                raw: true,
                replacements: { dbName: database }
            });
            await queryInterface.sequelize.query('CREATE DATABASE ' + database + ';', {
                raw: true,
                replacements: { dbName: database }
            });
            await queryInterface.sequelize.query('USE ' + database + ';', {
                raw: true,
                replacements: { dbName: database }
            });
            await queryInterface.sequelize.query(`SET FOREIGN_KEY_CHECKS=0;`, { raw: true });

            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS SequelizeMeta;`, { raw: true });
            await queryInterface.sequelize.query('USE ' + database + ';', {
                raw: true
            });
            await queryInterface.sequelize.query(
                `CREATE TABLE SequelizeMeta (
                  name varchar(255) COLLATE utf8_unicode_ci NOT NULL,
                  PRIMARY KEY (name),
                  UNIQUE KEY name (name)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`LOCK TABLES SequelizeMeta WRITE;`, { raw: true });
            await queryInterface.sequelize.query(
                `INSERT INTO SequelizeMeta VALUES
                ('20200428075413-initial-migration.js'),
                ('20200623131525-add-createdBy-in-user-model.js'),
                ('20200625084937-add-user-types.js'),
                ('20200625203615-merchant_add_business_id.js'),
                ('20200626065643-user-type_to_usertype.js'),
                ('20200626084617-addedMissingRoleToDb.js'),
                ('20200630125527-add-user-refresh-token.js'),
                ('20200701090459-add-soft-deleted-properties.js'),
                ('20200713123438-renamed-tables.js'),
                ('20200713145018-primarykey-bigint.js'),
                ('20200714074540-seed-new-roles-user-types.js'),
                ('20200716123003-mypay-integrations.js'),
                ('20200717072737-snake-case.js'),
                ('20200720131329-adding-reseller-user-type.js'),
                ('20200722070810-add-owner-role.js'),
                ('20200723071852-business-types.js'),
                ('20200728110854-onboarding-step-1-fields.js'),
                ('20200730121808-onboarding-step-4-add-owner-table.js'),
                ('20200730122254-onboarding-step-2.js'),
                ('20200730134955-onboarding-step-4-add-primary-owner-id-for-merchant.js'),
                ('20200803111547-onboarding-step-5-tags.js'),
                ('20200803152654-documents.js'),
                ('20200804132819-onboarding-step-5-business-profile.js'),
                ('20200805064100-onboarding-step-6-fields.js'),
                ('20200805082436-onboarding-step-7.js'),
                ('20200807084224-onboarding-step-5-relationship-tables.js'),
                ('20200812143456-mypay-integrations.js'),
                ('20200814072235-add-column-for-merchant-status.js'),
                ('20200820151849-add-column-for-max-ticket-value.js'),
                ('20200821095043-make-business-type-allow-null-for-business-details.js'),
                ('20200821142204-update-birthdate-column-for-owner.js'),
                ('20200824155239-remove-legal-name-column-from-business-details.js'),
                ('20200902071606-add-business-back-details-table.js'),
                ('20200904113629-adding-withdrawal-status.js'),
                ('20200907132837-remove-businessType-startup-from-business-profile.js'),
                ('20200907143925-adding-withdrawal.js'),
                ('20200908084626-business-profile-timeInBusiness-to-startedBusinessAt.js'),
                ('20200908180801-documents-add-column-flag.js'),
                ('20200909104618-add-admin-user-type.js'),
                ('20200909143137-add-bank-validation-flag.js'),
                ('20200910143110-add-channel-for-transaction.js'),
                ('20200914073951-add-is_email_confirmed-to-user-table.js'),
                ('20200914175730-adding-internal-transfer-status.js'),
                ('20200914175927-adding-internal-transfer.js'),
                ('20200915111840-add-business-creation-date.js'),
                ('20200917114239-add-merchant-label.js'),
                ('20200922115626-add-merchantId-merchantStoreId-relationship-table.js'),
                ('20200922121208-add-account-status-and-verifications-for-merchants.js'),
                ('20200922124645-users-picture-url-size.js'),
                ('20200923074133-add-merchant-stripe-id.js'),
                ('20200923074807-add-merchant-third-party-reseller-id.js'),
                ('20200925125742-add-country-for-merchant.js'),
                ('20200928130909-adding_reseller_table.js'),
                ('20200929081733-change-sortCode-and-newAccountNumber-to-string.js'),
                ('20200929090114-onboarding-us.js'),
                ('20200929112307-onboarding-ireland.js'),
                ('20200929125848-onboarding-australia.js'),
                ('20200930090847-add-default-value-for-country.js'),
                ('20200930144245-add-datman-merchant-id.js'),
                ('20200930144845-onboarding-canada.js'),
                ('20200930161632-add-reseller-email.js'),
                ('20201001112124-add-email-to-business-detail.js'),
                ('20201001150023-add_reseller_term_and_cond.js'),
                ('20201002131859-allow_null_for_stock_location_in_business_profile_table.js');`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`UNLOCK TABLES;`, { raw: true });

            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS addresses;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE addresses (
                  id int NOT NULL AUTO_INCREMENT,
                  phone_number varchar(255) DEFAULT NULL,
                  post_code varchar(255) DEFAULT NULL,
                  address_line_1 varchar(255) DEFAULT NULL,
                  address_line_2 varchar(255) DEFAULT NULL,
                  city varchar(255) DEFAULT NULL,
                  country varchar(255) DEFAULT NULL,
                  created_at datetime NOT NULL,
                  updated_at datetime NOT NULL,
                  PRIMARY KEY (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS business_bank_details;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE business_bank_details (
                  id int NOT NULL AUTO_INCREMENT,
                  sort_code varchar(255) DEFAULT NULL,
                  new_account_number varchar(255) DEFAULT NULL,
                  account_holder_name varchar(255) DEFAULT NULL,
                  created_at datetime NOT NULL,
                  updated_at datetime NOT NULL,
                  is_validated tinyint(1) DEFAULT 0,
                  routing_number varchar(255) DEFAULT NULL,
                  name_of_bank varchar(255) DEFAULT NULL,
                  bank_address_1 varchar(255) DEFAULT NULL,
                  bank_address_2 varchar(255) DEFAULT NULL,
                  bsb varchar(255) DEFAULT NULL,
                  PRIMARY KEY (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS business_descriptions;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE business_descriptions (
                  id int NOT NULL AUTO_INCREMENT,
                  name varchar(255) NOT NULL,
                  created_at datetime NOT NULL,
                  updated_at datetime NOT NULL,
                  PRIMARY KEY (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`LOCK TABLES business_descriptions WRITE;`, { raw: true });
            await queryInterface.sequelize.query(
                `INSERT INTO business_descriptions VALUES
                (1, 'MCC 4111 TRANSPORT-SUBURBAN & LOCAL COMMUTER', '2020-08-04 13:43:32', '2020-08-04 13:43:32'),
                (2, 'MCC 4121 Limousine and Taxicabs', '2020-08-04 13:43:32', '2020-08-04 13:43:32'),
                (3, 'MCC 4816 COMPUTER NETWORK/ Information services', '2020-08-04 13:43:32', '2020-08-04 13:43:32'),
                (4, 'MCC 5013 Motor vehicle', '2020-08-04 13:43:32', '2020-08-04 13:43:32'),
                (5, 'MCC 5065 Electrical Parts and Equipment', '2020-08-04 13:43:32', '2020-08-04 13:43:32'),
                (6, 'MCC 5074 Plumbing & heating equipment', '2020-08-04 13:43:32', '2020-08-04 13:43:32'),
                (7, 'MCC 5411 Grocery Stores Supermarkets', '2020-08-04 13:43:32', '2020-08-04 13:43:32'),
                (8, 'MCC 5814 Fast Food Restaurants', '2020-08-04 13:43:32', '2020-08-04 13:43:32'),
                (9, 'MCC 7211 Dry Cleaners', '2020-08-04 13:43:32', '2020-08-04 13:43:32'),
                (10, 'MCC 5940 5940 Bicycle Shops - Sales & Service', '2020-08-04 13:43:32', '2020-08-04 13:43:32'),
                (11, 'MCC 5942 Book Stores', '2020-08-04 13:43:32', '2020-08-04 13:43:32'),
                (12, 'MCC 5944 Clock, Jewelry, watch and Silverware Store', '2020-08-04 13:43:32', '2020-08-04 13:43:32'),
                (13, 'MCC 5945 Game, Toy and Hobby Shops', '2020-08-04 13:43:32', '2020-08-04 13:43:32'),
                (14, 'MCC 5948 Leather Goods & Luggage stores', '2020-08-04 13:43:32', '2020-08-04 13:43:32'),
                (15, 'MCC 5977 Cosmetic Stores', '2020-08-04 13:43:32', '2020-08-04 13:43:32');`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`UNLOCK TABLES;`, { raw: true });
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS business_details;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE business_details (
                  id int NOT NULL AUTO_INCREMENT,
                  business_type_id int DEFAULT NULL,
                  registered_number varchar(255) DEFAULT NULL,
                  vat_number varchar(255) DEFAULT NULL,
                  trading_name varchar(255) DEFAULT NULL,
                  phone_number varchar(255) DEFAULT NULL,
                  website_url varchar(255) DEFAULT NULL,
                  created_at datetime NOT NULL,
                  updated_at datetime NOT NULL,
                  creation_date datetime DEFAULT '0000-00-00 00:00:00',
                  employee_id_number varchar(255) DEFAULT NULL,
                  PRIMARY KEY (id),
                  KEY business_type_id (business_type_id),
                  CONSTRAINT business_details_ibfk_1 FOREIGN KEY (business_type_id) REFERENCES business_types (id) ON DELETE CASCADE
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS business_profile;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE business_profile (
                  id int NOT NULL AUTO_INCREMENT,
                  merchant_id int NOT NULL,
                  is_business_making_products tinyint(1) NOT NULL,
                  stock_location varchar(255) NOT NULL,
                  is_stock_sufficient tinyint(1) NOT NULL,
                  created_at datetime NOT NULL,
                  updated_at datetime NOT NULL,
                  started_business_at datetime DEFAULT NULL,
                  PRIMARY KEY (id),
                  KEY merchant_id (merchant_id),
                  CONSTRAINT business_profile_ibfk_1 FOREIGN KEY (merchant_id) REFERENCES merchants (id) ON DELETE CASCADE
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS business_types;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE business_types (
                  id int NOT NULL AUTO_INCREMENT,
                  name varchar(255) DEFAULT NULL,
                  created_at datetime NOT NULL,
                  updated_at datetime NOT NULL,
                  PRIMARY KEY (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`LOCK TABLES business_types WRITE;`, { raw: true });
            await queryInterface.sequelize.query(
                `INSERT INTO business_types VALUES
                (1, 'Limited', '2020-08-04 13:43:30', '2020-08-04 13:43:30'),
                (2, 'Sole Trader', '2020-08-04 13:43:30', '2020-08-04 13:43:30'),
                (3, 'LLP', '2020-08-04 13:43:30', '2020-08-04 13:43:30'),
                (4, 'PLC',' 2020-08-04 13:43:30', '2020-08-04 13:43:30'),
                (5, 'Partnership', '2020-08-04 13:43:30',' 2020-08-04 13:43:30');`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`UNLOCK TABLES;`, { raw: true });
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS businesses;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE businesses (
                  id int NOT NULL AUTO_INCREMENT,
                  name varchar(255) DEFAULT NULL,
                  description varchar(255) DEFAULT NULL,
                  created_at datetime NOT NULL,
                  updated_at datetime NOT NULL,
                  deleted_at datetime DEFAULT NULL,
                  PRIMARY KEY (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS card_stream_transactions;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE card_stream_transactions (
                  id int NOT NULL AUTO_INCREMENT,
                  action varchar(255) DEFAULT NULL,
                  raw_response text,
                  xref varchar(255) DEFAULT NULL,
                  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  PRIMARY KEY (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS clients;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE clients (
                  id int NOT NULL AUTO_INCREMENT,
                  name varchar(255) DEFAULT NULL,
                  description varchar(255) DEFAULT NULL,
                  business_id int DEFAULT NULL,
                  created_at datetime NOT NULL,
                  updated_at datetime NOT NULL,
                  deleted_at datetime DEFAULT NULL,
                  PRIMARY KEY (id),
                  KEY Clients_ibfk_1 (business_id),
                  CONSTRAINT Clients_ibfk_1 FOREIGN KEY (business_id) REFERENCES businesses (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS documents;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE documents (
                  id bigint NOT NULL,
                  filename varchar(255) DEFAULT NULL,
                  size varchar(255) DEFAULT NULL,
                  merchant_id int DEFAULT NULL,
                  created_at datetime NOT NULL,
                  updated_at datetime NOT NULL,
                  flag varchar(255) DEFAULT NULL,
                  PRIMARY KEY (id),
                  KEY merchant_id (merchant_id),
                  CONSTRAINT documents_ibfk_1 FOREIGN KEY (merchant_id) REFERENCES merchants (id) ON DELETE CASCADE
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS email_request_log;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE email_request_log (
                  id int NOT NULL AUTO_INCREMENT,
                  encryptdata varchar(255) DEFAULT NULL,
                  merchant_id int NOT NULL,
                  email_ref varchar(255) DEFAULT NULL,
                  temp_trans_id int DEFAULT NULL,
                  data varchar(255) DEFAULT NULL,
                  status enum('PENDING', 'PROCESSED') DEFAULT NULL,
                  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  PRIMARY KEY (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS identity_provider_mypay_relations;`, {
                raw: true
            });
            await queryInterface.sequelize.query(
                `CREATE TABLE identity_provider_mypay_relations (
                  id int NOT NULL AUTO_INCREMENT,
                  user_id int DEFAULT NULL,
                  provider_id varchar(255) DEFAULT NULL,
                  provider_name varchar(255) DEFAULT NULL,
                  is_active tinyint(1) DEFAULT NULL,
                  created_at datetime NOT NULL,
                  updated_at datetime NOT NULL,
                  PRIMARY KEY (id),
                  KEY identity_provider_mypay_relations_ibfk_1 (user_id),
                  CONSTRAINT identity_provider_mypay_relations_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS internal_transfer_status;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE internal_transfer_status (
                  id int NOT NULL AUTO_INCREMENT,
                  name varchar(255) NOT NULL,
                  created_at datetime NOT NULL,
                  updated_at datetime NOT NULL,
                  PRIMARY KEY (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`LOCK TABLES internal_transfer_status WRITE;`, { raw: true });
            await queryInterface.sequelize.query(
                `INSERT INTO internal_transfer_status VALUES
                (1, 'Pending', '2020-09-14 20:04:26', '2020-09-14 20:04:26'),
                (2, 'Sent', '2020-09-14 20:04:26',' 2020-09-14 20:04:26'),
                (3, 'Not Received', '2020-09-14 20:04:26', '2020-09-14 20:04:26'),
                (4, 'Cancelled', '2020-09-14 20:04:26', '2020-09-14 20:04:26');`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`UNLOCK TABLES;`, { raw: true });
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS internal_transfers;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE internal_transfers (
                  id int NOT NULL AUTO_INCREMENT,
                  amount float NOT NULL,
                  merchant_from_id int NOT NULL,
                  merchant_to_id int NOT NULL,
                  requested_by int NOT NULL,
                  status_id int NOT NULL,
                  description varchar(255) NOT NULL,
                  created_at datetime NOT NULL,
                  updated_at datetime NOT NULL,
                  PRIMARY KEY (id),
                  KEY merchant_from_id (merchant_from_id),
                  KEY merchant_to_id (merchant_to_id),
                  KEY requested_by (requested_by),
                  KEY status_id (status_id),
                  CONSTRAINT internal_transfers_ibfk_1 FOREIGN KEY (merchant_from_id) REFERENCES merchants (id) ON DELETE CASCADE,
                  CONSTRAINT internal_transfers_ibfk_2 FOREIGN KEY (merchant_to_id) REFERENCES merchants (id) ON DELETE CASCADE,
                  CONSTRAINT internal_transfers_ibfk_3 FOREIGN KEY (requested_by) REFERENCES users (id),
                  CONSTRAINT internal_transfers_ibfk_4 FOREIGN KEY (status_id) REFERENCES internal_transfer_status (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS items;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE items (
                  id int NOT NULL AUTO_INCREMENT,
                  data varchar(255) DEFAULT NULL,
                  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  PRIMARY KEY (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS merchant_owners;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE merchant_owners (
                  id int NOT NULL AUTO_INCREMENT,
                  merchant_id int DEFAULT NULL,
                  owner_id int DEFAULT NULL,
                  created_at datetime NOT NULL,
                  updated_at datetime NOT NULL,
                  PRIMARY KEY (id),
                  KEY merchant_id (merchant_id),
                  KEY owner_id (owner_id),
                  CONSTRAINT merchant_owners_ibfk_1 FOREIGN KEY (merchant_id) REFERENCES merchants (id),
                  CONSTRAINT merchant_owners_ibfk_2 FOREIGN KEY (owner_id) REFERENCES owners_details (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS merchant_resellers;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE merchant_resellers (
                  id int NOT NULL AUTO_INCREMENT,
                  merchant_id int NOT NULL,
                  reseller_reference int NOT NULL,
                  created_at datetime NOT NULL,
                  updated_at datetime NOT NULL,
                  PRIMARY KEY (id),
                  KEY merchant_id (merchant_id),
                  CONSTRAINT merchant_resellers_ibfk_1 FOREIGN KEY (merchant_id) REFERENCES merchants (id) ON DELETE CASCADE
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS merchants;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE merchants (
                  id int NOT NULL AUTO_INCREMENT,
                  name varchar(255) DEFAULT NULL,
                  description varchar(255) DEFAULT NULL,
                  client_id int DEFAULT NULL,
                  business_id int DEFAULT NULL,
                  created_at datetime NOT NULL,
                  updated_at datetime NOT NULL,
                  deleted_at datetime DEFAULT NULL,
                  onboarding_step int DEFAULT 1,
                  legal_name varchar(255) DEFAULT NULL,
                  base_address_id int DEFAULT NULL,
                  trading_address_id int DEFAULT NULL,
                  business_detail_id int DEFAULT NULL,
                  primary_owner_id int DEFAULT NULL,
                  status int DEFAULT 0,
                  business_bank_details_id int DEFAULT NULL,
                  label varchar(255) DEFAULT NULL,
                  account_status varchar(255) DEFAULT 'Pending',
                  is_bank_account_verified tinyint(1) DEFAULT 0,
                  is_account_verified tinyint(1) DEFAULT 0,
                  stripe_id varchar(255) DEFAULT NULL,
                  country varchar(255) NOT NULL DEFAULT 'United Kingdom',
                  datman_merchant_id int DEFAULT NULL,
                  PRIMARY KEY (id),
                  KEY Merchants_ibfk_1 (client_id),
                  KEY merchants_base_address_id_foreign_idx (base_address_id),
                  KEY merchants_trading_address_id_foreign_idx (trading_address_id),
                  KEY merchants_business_detail_id_foreign_idx (business_detail_id),
                  KEY merchants_primary_owner_id_foreign_idx (primary_owner_id),
                  KEY merchants_business_bank_details_id_foreign_idx (business_bank_details_id),
                  CONSTRAINT merchants_base_address_id_foreign_idx FOREIGN KEY (base_address_id) REFERENCES addresses (id),
                  CONSTRAINT merchants_business_bank_details_id_foreign_idx FOREIGN KEY (business_bank_details_id) REFERENCES business_bank_details (id),
                  CONSTRAINT merchants_business_detail_id_foreign_idx FOREIGN KEY (business_detail_id) REFERENCES business_details (id),
                  CONSTRAINT Merchants_ibfk_1 FOREIGN KEY (client_id) REFERENCES clients (id),
                  CONSTRAINT merchants_primary_owner_id_foreign_idx FOREIGN KEY (primary_owner_id) REFERENCES owners_details (id),
                  CONSTRAINT merchants_trading_address_id_foreign_idx FOREIGN KEY (trading_address_id) REFERENCES addresses (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS merchants_business_descriptions;`, {
                raw: true
            });
            await queryInterface.sequelize.query(
                `CREATE TABLE merchants_business_descriptions (
                  id int NOT NULL AUTO_INCREMENT,
                  merchant_id int NOT NULL,
                  business_description_id int NOT NULL,
                  created_at datetime NOT NULL,
                  updated_at datetime NOT NULL,
                  PRIMARY KEY (id),
                  UNIQUE KEY fk_unique_constraint (business_description_id,merchant_id),
                  KEY merchant_id (merchant_id),
                  CONSTRAINT merchants_business_descriptions_ibfk_1 FOREIGN KEY (merchant_id) REFERENCES merchants (id),
                  CONSTRAINT merchants_business_descriptions_ibfk_2 FOREIGN KEY (business_description_id) REFERENCES business_descriptions (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS merchants_external_merchant_ids_relationship;`, {
                raw: true
            });
            await queryInterface.sequelize.query(
                `CREATE TABLE merchants_external_merchant_ids_relationship (
                  id int NOT NULL AUTO_INCREMENT,
                  merchant_id int DEFAULT NULL,
                  orderNumber int DEFAULT NULL,
                  external_merchant_id int DEFAULT NULL,
                  external_merchant_store_id int DEFAULT NULL,
                  created_at datetime NOT NULL,
                  updated_at datetime NOT NULL,
                  PRIMARY KEY (id),
                  KEY merchant_id (merchant_id),
                  CONSTRAINT merchants_external_merchant_ids_relationship_ibfk_1 FOREIGN KEY (merchant_id) REFERENCES merchants (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS merchants_products_descriptions;`, {
                raw: true
            });
            await queryInterface.sequelize.query(
                `CREATE TABLE merchants_products_descriptions (
                  id int NOT NULL AUTO_INCREMENT,
                  merchant_id int NOT NULL,
                  product_description_id int NOT NULL,
                  created_at datetime NOT NULL,
                  updated_at datetime NOT NULL,
                  PRIMARY KEY (id),
                  UNIQUE KEY fk_unique_constraint (product_description_id,merchant_id),
                  KEY merchant_id (merchant_id),
                  CONSTRAINT merchants_products_descriptions_ibfk_1 FOREIGN KEY (merchant_id) REFERENCES merchants (id),
                  CONSTRAINT merchants_products_descriptions_ibfk_2 FOREIGN KEY (product_description_id) REFERENCES product_descriptions (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS merchants_products_required;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE merchants_products_required (
                  id int NOT NULL AUTO_INCREMENT,
                  merchant_id int NOT NULL,
                  product_required_id int NOT NULL,
                  created_at datetime NOT NULL,
                  updated_at datetime NOT NULL,
                  PRIMARY KEY (id),
                  UNIQUE KEY fk_unique_constraint (product_required_id,merchant_id),
                  KEY merchant_id (merchant_id),
                  CONSTRAINT merchants_products_required_ibfk_1 FOREIGN KEY (merchant_id) REFERENCES merchants (id),
                  CONSTRAINT merchants_products_required_ibfk_2 FOREIGN KEY (product_required_id) REFERENCES products_required (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS moto_renewal_reason;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE moto_renewal_reason (
                  id int NOT NULL AUTO_INCREMENT,
                  name varchar(255) DEFAULT NULL,
                  created_at datetime NOT NULL,
                  updated_at datetime NOT NULL,
                  PRIMARY KEY (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`LOCK TABLES moto_renewal_reason WRITE;`, { raw: true });
            await queryInterface.sequelize.query(
                `INSERT INTO moto_renewal_reason VALUES
                (1, 'Renewal Reason 1', '2020-08-13 09:16:29', '2020-08-13 09:16:29'),
                (2, 'Renewal Reason 2', '2020-08-13 09:16:29', '2020-08-13 09:16:29'),
                (3, 'Renewal Reason 3', '2020-08-13 09:16:29', '2020-08-13 09:16:29');`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`UNLOCK TABLES;`, { raw: true });
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS owners_details;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE owners_details (
                  id int NOT NULL AUTO_INCREMENT,
                  title varchar(255) DEFAULT NULL,
                  full_name varchar(255) DEFAULT NULL,
                  nationality varchar(255) DEFAULT NULL,
                  birth_date varchar(255) DEFAULT NULL,
                  email varchar(255) DEFAULT NULL,
                  contact_phone varchar(255) DEFAULT NULL,
                  business_title varchar(255) DEFAULT NULL,
                  ownership int DEFAULT NULL,
                  ownership_type varchar(255) DEFAULT NULL,
                  owner_address_id int DEFAULT NULL,
                  created_at datetime NOT NULL,
                  updated_at datetime NOT NULL,
                  ssn_last_digits varchar(255) DEFAULT NULL,
                  PRIMARY KEY (id),
                  KEY owner_address_id (owner_address_id),
                  CONSTRAINT owners_details_ibfk_1 FOREIGN KEY (owner_address_id) REFERENCES addresses (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS product_descriptions;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE product_descriptions (
                  id int NOT NULL AUTO_INCREMENT,
                  name varchar(255) NOT NULL,
                  created_at datetime NOT NULL,
                  updated_at datetime NOT NULL,
                  PRIMARY KEY (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`LOCK TABLES product_descriptions WRITE;`, { raw: true });
            await queryInterface.sequelize.query(
                `INSERT INTO product_descriptions VALUES
                (1, 'PC', '2020-08-04 13:43:32', '2020-08-04 13:43:32'),
                (2, 'Peripherals', '2020-08-04 13:43:32', '2020-08-04 13:43:32'),
                (3, 'Cars', '2020-08-04 13:43:32', '2020-08-04 13:43:32'),
                (4, 'Food', '2020-08-04 13:43:32', '2020-08-04 13:43:32');`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`UNLOCK TABLES;`, { raw: true });
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS products_required;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE products_required (
                  id int NOT NULL AUTO_INCREMENT,
                  name varchar(255) NOT NULL,
                  description varchar(255) DEFAULT NULL,
                  created_at datetime NOT NULL,
                  updated_at datetime NOT NULL,
                  PRIMARY KEY (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`LOCK TABLES products_required WRITE;`, { raw: true });
            await queryInterface.sequelize.query(
                `INSERT INTO products_required VALUES
                (1, 'Gateway', 'Lorem Ipsum', '2020-08-13 09:16:30', '2020-08-13 09:16:30'),
                (2, 'MyPay App', 'Lorem Ipsum', '2020-08-13 09:16:30', '2020-08-13 09:16:30'),
                (3, 'Virtual Terminal', 'Lorem Ipsum', '2020-08-13 09:16:30', '2020-08-13 09:16:30'),
                (4, 'MyEcomm', 'Lorem Ipsum', '2020-08-13 09:16:30', '2020-08-13 09:16:30'),
                (5, 'Card Machine', 'Lorem Ipsum', '2020-08-13 09:16:30', '2020-08-13 09:16:30');`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`UNLOCK TABLES;`, { raw: true });
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS refunds;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE refunds (
                  id int NOT NULL AUTO_INCREMENT,
                  merchant_id int DEFAULT NULL,
                  amount int NOT NULL,
                  fee int DEFAULT NULL,
                  net int DEFAULT NULL,
                  currency_code int NOT NULL,
                  transaction_id int DEFAULT NULL,
                  provider enum('CS') DEFAULT NULL,
                  provider_response_id int NOT NULL,
                  reason varchar(255) NOT NULL,
                  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  PRIMARY KEY (id),
                  KEY merchant_id (merchant_id),
                  KEY transaction_id (transaction_id),
                  CONSTRAINT refunds_ibfk_1 FOREIGN KEY (merchant_id) REFERENCES merchants (id),
                  CONSTRAINT refunds_ibfk_2 FOREIGN KEY (transaction_id) REFERENCES transactions (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS relationships;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE relationships (
                  id int NOT NULL AUTO_INCREMENT,
                  user_id int DEFAULT NULL,
                  business_id int DEFAULT NULL,
                  client_id int DEFAULT NULL,
                  merchant_id int DEFAULT NULL,
                  role_id int DEFAULT NULL,
                  created_at datetime NOT NULL,
                  updated_at datetime NOT NULL,
                  deleted_at datetime DEFAULT NULL,
                  reseller_id int NOT NULL DEFAULT 1,
                  PRIMARY KEY (id),
                  KEY Relationships_ibfk_1 (business_id),
                  KEY Relationships_ibfk_2 (client_id),
                  KEY Relationships_ibfk_3 (merchant_id),
                  KEY Relationships_ibfk_4 (user_id),
                  KEY Relationships_ibfk_5 (role_id),
                  KEY relationships_reseller_id_foreign_idx (reseller_id),
                  CONSTRAINT Relationships_ibfk_1 FOREIGN KEY (business_id) REFERENCES businesses (id),
                  CONSTRAINT Relationships_ibfk_2 FOREIGN KEY (client_id) REFERENCES clients (id),
                  CONSTRAINT Relationships_ibfk_3 FOREIGN KEY (merchant_id) REFERENCES merchants (id),
                  CONSTRAINT Relationships_ibfk_4 FOREIGN KEY (user_id) REFERENCES users (id),
                  CONSTRAINT Relationships_ibfk_5 FOREIGN KEY (role_id) REFERENCES roles (id),
                  CONSTRAINT relationships_reseller_id_foreign_idx FOREIGN KEY (reseller_id) REFERENCES resellers (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS resellers;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE resellers (
                  id int NOT NULL AUTO_INCREMENT,
                  name varchar(255) DEFAULT NULL,
                  logo varchar(255) DEFAULT NULL,
                  website_url varchar(255) DEFAULT NULL,
                  contact_us_page_url varchar(255) DEFAULT NULL,
                  help_page_url varchar(255) DEFAULT NULL,
                  created_at datetime DEFAULT NULL,
                  updated_at datetime NOT NULL,
                  deleted_at datetime DEFAULT NULL,
                  PRIMARY KEY (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`LOCK TABLES resellers WRITE;`, { raw: true });
            await queryInterface.sequelize.query(
                `INSERT INTO resellers VALUES
                (1, 'MyPay', 'MyPay', 'https://MyPay.co.uk', 'https://mypay.co.uk/contact-us' , 'https://mypay.co.uk/help', '2020-09-30 14:39:57', '2020-09-30 14:39:57', NULL),
                (2, 'Dummy T2S', 'Dummy T2S', 'https://MyPay.co.uk', 'https://fake.mypay.co.uk/contact-us', 'https://fake.mypay.co.uk/help', '2020-09-30 14:39:57', '2020-09-30 14:39:57', NULL);`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`UNLOCK TABLES;`, { raw: true });
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS roles;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE roles (
                  id int NOT NULL AUTO_INCREMENT,
                  name varchar(255) NOT NULL,
                  created_at datetime NOT NULL,
                  updated_at datetime NOT NULL,
                  PRIMARY KEY (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`LOCK TABLES roles WRITE;`, { raw: true });
            await queryInterface.sequelize.query(
                `INSERT INTO roles VALUES
                (1, 'Admin', '2020-07-16 14:09:39', '2020-07-16 14:09:39'),
                (2, 'User', '2020-07-16 14:09:39', '2020-07-16 14:09:39'),
                (3, 'Manager', '2020-07-16 14:09:39', '2020-07-16 14:09:39'),
                (4, 'Owner', '2020-07-31 08:31:49', '2020-07-31 08:31:49');`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`UNLOCK TABLES;`, { raw: true });
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS security_credentials;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE security_credentials (
                  id int NOT NULL AUTO_INCREMENT,
                  access_key varchar(255) NOT NULL,
                  secret_key varchar(255) NOT NULL,
                  merchant_id int NOT NULL,
                  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  PRIMARY KEY (id),
                  KEY merchant_id (merchant_id),
                  CONSTRAINT security_credentials_ibfk_1 FOREIGN KEY (merchant_id) REFERENCES merchants (id)
                );`,
                { raw: true }
            );

            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS shoppers;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE shoppers (
                  id int NOT NULL AUTO_INCREMENT,
                  first_name varchar(255) NOT NULL,
                  last_name varchar(255) NOT NULL,
                  email varchar(255) NOT NULL,
                  address varchar(255) DEFAULT NULL,
                  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  PRIMARY KEY (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS stats;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE stats (
                  id int NOT NULL AUTO_INCREMENT,
                  merchant_id int DEFAULT NULL,
                  sale_count int DEFAULT NULL,
                  sale_amount int DEFAULT NULL,
                  sale_fee int DEFAULT NULL,
                  sale_net int DEFAULT NULL,
                  refund_count int DEFAULT NULL,
                  refund_amount int DEFAULT NULL,
                  refund_fee int DEFAULT NULL,
                  refund_net int DEFAULT NULL,
                  currency_code varchar(255) DEFAULT NULL,
                  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  PRIMARY KEY (id),
                  KEY merchant_id (merchant_id),
                  CONSTRAINT stats_ibfk_1 FOREIGN KEY (merchant_id) REFERENCES merchants (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS temp_transactions;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE temp_transactions (
                  id int NOT NULL AUTO_INCREMENT,
                  merchant_id int DEFAULT NULL,
                  user_order_ref varchar(255) NOT NULL,
                  shopper_id int DEFAULT NULL,
                  item_id int DEFAULT NULL,
                  meta_id int DEFAULT NULL,
                  amount int NOT NULL,
                  currency_code varchar(255) NOT NULL,
                  status enum('IN_PROGRESS','PROCESSED') DEFAULT NULL,
                  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  PRIMARY KEY (id),
                  KEY merchant_id (merchant_id),
                  KEY shopper_id (shopper_id),
                  KEY item_id (item_id),
                  KEY meta_id (meta_id),
                  CONSTRAINT temp_transactions_ibfk_1 FOREIGN KEY (merchant_id) REFERENCES merchants (id),
                  CONSTRAINT temp_transactions_ibfk_2 FOREIGN KEY (shopper_id) REFERENCES shoppers (id),
                  CONSTRAINT temp_transactions_ibfk_3 FOREIGN KEY (item_id) REFERENCES items (id),
                  CONSTRAINT temp_transactions_ibfk_4 FOREIGN KEY (meta_id) REFERENCES temp_transactions_meta (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS temp_transactions_meta;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE temp_transactions_meta (
                  id int NOT NULL AUTO_INCREMENT,
                  data varchar(255) NOT NULL,
                  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  PRIMARY KEY (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS transaction_profile;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE transaction_profile (
                  id int NOT NULL AUTO_INCREMENT,
                  merchant_id int DEFAULT NULL,
                  is_deposits_taken tinyint(1) DEFAULT NULL,
                  goods int DEFAULT NULL,
                  card_turnover int DEFAULT NULL,
                  deposit_far_days int DEFAULT NULL,
                  no_delivery_days int DEFAULT NULL,
                  is_pre_payment tinyint(1) DEFAULT NULL,
                  full_pre_payments int DEFAULT NULL,
                  advance_full_payment_days int DEFAULT NULL,
                  company_turn_over_actual int DEFAULT NULL,
                  company_turn_over_projected int DEFAULT NULL,
                  card_turn_over_actual int DEFAULT NULL,
                  card_turn_over_projected int DEFAULT NULL,
                  price_range_min int DEFAULT NULL,
                  price_range_max int DEFAULT NULL,
                  price_range_avg int DEFAULT NULL,
                  is_moto_payment tinyint(1) DEFAULT NULL,
                  is_max_ticket_applied tinyint(1) DEFAULT NULL,
                  total_card_turnover_is_moto int DEFAULT NULL,
                  advance_goods_moto_provided_days int DEFAULT NULL,
                  is_auto_renew_transactions tinyint(1) DEFAULT NULL,
                  reason_for_moto_renewal_id int DEFAULT NULL,
                  created_at datetime NOT NULL,
                  updated_at datetime NOT NULL,
                  max_ticket_value decimal(7,2) DEFAULT NULL,
                  PRIMARY KEY (id),
                  KEY merchant_id (merchant_id),
                  KEY reason_for_moto_renewal_id (reason_for_moto_renewal_id),
                  CONSTRAINT transaction_profile_ibfk_1 FOREIGN KEY (merchant_id) REFERENCES merchants (id),
                  CONSTRAINT transaction_profile_ibfk_2 FOREIGN KEY (reason_for_moto_renewal_id) REFERENCES moto_renewal_reason (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS transactions;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE transactions (
                  id int NOT NULL AUTO_INCREMENT,
                  merchant_id int DEFAULT NULL,
                  user_order_ref varchar(255) DEFAULT NULL,
                  amount int NOT NULL,
                  fee int NOT NULL,
                  net int NOT NULL,
                  currency_code varchar(255) NOT NULL,
                  refund_id int DEFAULT NULL,
                  shopper_id int DEFAULT NULL,
                  item_id int DEFAULT NULL,
                  provider enum('CS') DEFAULT NULL,
                  provider_response_id bigint NOT NULL,
                  user_agent_id int DEFAULT NULL,
                  last_4digits varchar(255) DEFAULT NULL,
                  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  channel int DEFAULT NULL,
                  PRIMARY KEY (id),
                  KEY merchant_id (merchant_id),
                  KEY shopper_id (shopper_id),
                  KEY item_id (item_id),
                  KEY transactions_channel_foreign_idx (channel),
                  CONSTRAINT transactions_channel_foreign_idx FOREIGN KEY (channel) REFERENCES products_required (id),
                  CONSTRAINT transactions_ibfk_1 FOREIGN KEY (merchant_id) REFERENCES merchants (id),
                  CONSTRAINT transactions_ibfk_2 FOREIGN KEY (shopper_id) REFERENCES shoppers (id),
                  CONSTRAINT transactions_ibfk_3 FOREIGN KEY (item_id) REFERENCES items (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS user_types;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE user_types (
                  id int NOT NULL AUTO_INCREMENT,
                  name varchar(255) NOT NULL,
                  created_at datetime NOT NULL,
                  updated_at datetime NOT NULL,
                  PRIMARY KEY (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`LOCK TABLES user_types WRITE;`, { raw: true });
            await queryInterface.sequelize.query(
                `INSERT INTO user_types VALUES
                (1, 'Business', '2020-07-16 14:09:39', '2020-07-16 14:09:39'),
                (2, 'Client', '2020-07-16 14:09:39', '2020-07-16 14:09:39'),
                (3, 'Merchant', '2020-07-16 14:09:39', '2020-07-16 14:09:39'),
                (4, 'Reseller', '2020-07-20 13:48:07', '2020-07-20 13:48:07'),
                (5, 'Admin', '2020-09-09 15:09:17', '2020-09-09 15:09:17');`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`UNLOCK TABLES;`, { raw: true });
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS users;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE users (
                  id int NOT NULL,
                  first_name varchar(255) DEFAULT NULL,
                  last_name varchar(255) DEFAULT NULL,
                  email varchar(255) NOT NULL,
                  picture_url varchar(1024) DEFAULT NULL,
                  is_disable tinyint(1) DEFAULT NULL,
                  is_deleted tinyint(1) DEFAULT NULL,
                  created_at datetime NOT NULL,
                  updated_at datetime NOT NULL,
                  created_by varchar(255) DEFAULT NULL,
                  type_id int DEFAULT NULL,
                  refresh_token varchar(2000) DEFAULT NULL,
                  is_email_confirmed tinyint(1) DEFAULT 0,
                  PRIMARY KEY (id),
                  KEY Users_typeId_foreign_idx (type_id),
                  CONSTRAINT Users_typeId_foreign_idx FOREIGN KEY (type_id) REFERENCES user_types (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS users_cardstream_settings;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE users_cardstream_settings (
                  id int NOT NULL AUTO_INCREMENT,
                  merchant_id int DEFAULT NULL,
                  cs_merchant_id bigint NOT NULL,
                  country_code varchar(255) NOT NULL,
                  currency_code varchar(255) NOT NULL,
                  signature varchar(255) NOT NULL,
                  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  PRIMARY KEY (id),
                  KEY merchant_id (merchant_id),
                  CONSTRAINT users_cardstream_settings_ibfk_1 FOREIGN KEY (merchant_id) REFERENCES merchants (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS users_settings;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE users_settings (
                  id int NOT NULL AUTO_INCREMENT,
                  active_wl_service enum('CS') DEFAULT NULL,
                  merchant_id int DEFAULT NULL,
                  fee_percent int DEFAULT NULL,
                  progress_status enum('FRESH', 'REGISTERED', 'ACTIVE') DEFAULT NULL,
                  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  PRIMARY KEY (id),
                  KEY merchant_id (merchant_id),
                  CONSTRAINT users_settings_ibfk_1 FOREIGN KEY (merchant_id) REFERENCES merchants (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS withdrawal_status;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE withdrawal_status (
                  id int NOT NULL AUTO_INCREMENT,
                  name varchar(255) NOT NULL,
                  created_at datetime NOT NULL,
                  updated_at datetime NOT NULL,
                  PRIMARY KEY (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`LOCK TABLES withdrawal_status WRITE;`, { raw: true });
            await queryInterface.sequelize.query(
                `INSERT INTO withdrawal_status VALUES
                (1, 'Pending', '2020-09-08 14:52:37', '2020-09-08 14:52:37'),
                (2, 'Sent', '2020-09-08 14:52:37', '2020-09-08 14:52:37'),
                (3, 'Not Received', '2020-09-08 14:52:37', '2020-09-08 14:52:37'),
                (4, 'Cancelled', '2020-09-08 14:52:37', '2020-09-08 14:52:37');`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`UNLOCK TABLES;`, { raw: true });
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS withdrawals;`, { raw: true });
            await queryInterface.sequelize.query(
                `CREATE TABLE withdrawals (
                  id int NOT NULL AUTO_INCREMENT,
                  amount float NOT NULL,
                  merchant_id int NOT NULL,
                  requested_by int NOT NULL,
                  status_id int NOT NULL,
                  created_at datetime NOT NULL,
                  updated_at datetime NOT NULL,
                  PRIMARY KEY (id),
                  KEY merchant_id (merchant_id),
                  KEY requested_by (requested_by),
                  KEY status_id (status_id),
                  CONSTRAINT withdrawals_ibfk_1 FOREIGN KEY (merchant_id) REFERENCES merchants (id) ON DELETE CASCADE,
                  CONSTRAINT withdrawals_ibfk_2 FOREIGN KEY (requested_by) REFERENCES users (id),
                  CONSTRAINT withdrawals_ibfk_3 FOREIGN KEY (status_id) REFERENCES withdrawal_status (id)
                );`,
                { raw: true }
            );
            await queryInterface.sequelize.query(`SET FOREIGN_KEY_CHECKS=1;`, { raw: true });
        } catch (error) {
            console.error(error);
            await transaction.rollback();
        }
    },

    down: async (queryInterface, Sequelize) => {
        //Nothing to do here
    }
};
