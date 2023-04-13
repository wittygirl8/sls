"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    //Drop constraint
    await queryInterface.sequelize.query(
      `ALTER TABLE Merchants DROP foreign key Merchants_ibfk_1`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE Users DROP foreign key Users_typeId_foreign_idx`
    );
    await queryInterface.sequelize.query(
      `alter table Relationships drop foreign key Relationships_ibfk_1`
    );
    await queryInterface.sequelize.query(
      `alter table Relationships drop foreign key Relationships_ibfk_2`
    );
    await queryInterface.sequelize.query(
      `alter table Relationships drop foreign key Relationships_ibfk_3`
    );
    await queryInterface.sequelize.query(
      `alter table Relationships drop foreign key  Relationships_ibfk_4`
    );
    await queryInterface.sequelize.query(
      `alter table Relationships drop foreign key Relationships_ibfk_5`
    );
    await queryInterface.sequelize.query(
      `alter table identity_provider_mypay_relations drop foreign key  identity_provider_mypay_relations_ibfk_1`
    );
    await queryInterface.sequelize.query(
      `alter table Clients drop foreign key Clients_ibfk_1`
    );

    //Truncate
    await queryInterface.sequelize.query(`truncate table Merchants`);
    await queryInterface.sequelize.query(`truncate table Clients`);
    await queryInterface.sequelize.query(`truncate table Businesses`);
    await queryInterface.sequelize.query(`truncate table user_types`);
    await queryInterface.sequelize.query(
      `truncate table identity_provider_mypay_relations`
    );
    await queryInterface.sequelize.query(`truncate table Relationships`);
    await queryInterface.sequelize.query(`truncate table Roles`);
    await queryInterface.sequelize.query(`truncate table Users`);

    //Upgrade
    await queryInterface.sequelize.query(`
      ALTER TABLE Merchants
        MODIFY COLUMN id BIGINT NOT NULL,
        MODIFY COLUMN clientId BIGINT,
        MODIFY COLUMN businessId BIGINT`);

    await queryInterface.sequelize.query(`
      ALTER TABLE Businesses
          MODIFY COLUMN id BIGINT NOT NULL`);

    await queryInterface.sequelize.query(`
        ALTER TABLE Clients
          MODIFY COLUMN id BIGINT NOT NULL,
          MODIFY COLUMN businessId BIGINT`);

    await queryInterface.sequelize.query(`
        ALTER TABLE identity_provider_mypay_relations
          MODIFY COLUMN  id BIGINT NOT NULL,
          MODIFY COLUMN userId BIGINT`);

    await queryInterface.sequelize.query(`
        ALTER TABLE Relationships
          MODIFY COLUMN id BIGINT NOT NULL,
          MODIFY COLUMN userId BIGINT,
          MODIFY COLUMN businessId BIGINT,
          MODIFY COLUMN clientId BIGINT,
          MODIFY COLUMN merchantId BIGINT,
          MODIFY COLUMN roleId BIGINT`);

    await queryInterface.sequelize.query(`
      ALTER TABLE Roles
          MODIFY COLUMN id BIGINT NOT NULL`);

    await queryInterface.sequelize.query(`
        ALTER TABLE Users
          MODIFY COLUMN id BIGINT NOT NULL,
          MODIFY COLUMN typeId BIGINT`);

    await queryInterface.sequelize.query(`
        ALTER TABLE user_types
          MODIFY COLUMN id BIGINT NOT NULL`);

    //Add constraint
    await queryInterface.sequelize.query(
      `ALTER TABLE Merchants ADD CONSTRAINT Merchants_ibfk_1 FOREIGN KEY (clientId) REFERENCES Clients(id)`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE Users ADD CONSTRAINT Users_typeId_foreign_idx FOREIGN KEY (typeId) REFERENCES user_types(id)`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE Relationships ADD CONSTRAINT Relationships_ibfk_1 FOREIGN KEY (businessId) REFERENCES Businesses(id)`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE Relationships ADD CONSTRAINT Relationships_ibfk_2 FOREIGN KEY (clientId) REFERENCES Clients(id)`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE Relationships ADD CONSTRAINT Relationships_ibfk_3 FOREIGN KEY (merchantId) REFERENCES Merchants(id)`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE Relationships ADD CONSTRAINT Relationships_ibfk_4 FOREIGN KEY (userId) REFERENCES Users(id)`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE Relationships ADD CONSTRAINT Relationships_ibfk_5 FOREIGN KEY (roleId) REFERENCES Roles(id)`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE identity_provider_mypay_relations ADD CONSTRAINT identity_provider_mypay_relations_ibfk_1 FOREIGN KEY (userId) REFERENCES Users(id)`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE Clients ADD CONSTRAINT Clients_ibfk_1 FOREIGN KEY (businessId) REFERENCES Businesses(id)`
    );
  },

  down: async (queryInterface, Sequelize) => {
    //Drop constraint
    await queryInterface.sequelize.query(
      `ALTER TABLE Merchants DROP foreign key Merchants_ibfk_1`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE Users DROP foreign key Users_typeId_foreign_idx`
    );
    await queryInterface.sequelize.query(
      `alter table Relationships drop foreign key Relationships_ibfk_1`
    );
    await queryInterface.sequelize.query(
      `alter table Relationships drop foreign key Relationships_ibfk_2`
    );
    await queryInterface.sequelize.query(
      `alter table Relationships drop foreign key Relationships_ibfk_3`
    );
    await queryInterface.sequelize.query(
      `alter table Relationships drop foreign key Relationships_ibfk_4`
    );
    await queryInterface.sequelize.query(
      `alter table Relationships drop foreign key Relationships_ibfk_5`
    );
    await queryInterface.sequelize.query(
      `alter table identity_provider_mypay_relations drop foreign key identity_provider_mypay_relations_ibfk_1`
    );
    await queryInterface.sequelize.query(
      `alter table Clients drop foreign key Clients_ibfk_1`
    );

    //Truncate
    await queryInterface.sequelize.query(`truncate table Merchants`);
    await queryInterface.sequelize.query(`truncate table Clients`);
    await queryInterface.sequelize.query(`truncate table Businesses`);
    await queryInterface.sequelize.query(`truncate table user_types`);
    await queryInterface.sequelize.query(
      `truncate table identity_provider_mypay_relations`
    );
    await queryInterface.sequelize.query(`truncate table Relationships`);
    await queryInterface.sequelize.query(`truncate table Roles`);
    await queryInterface.sequelize.query(`truncate table Users`);

    //Upgrade
    await queryInterface.sequelize.query(`
      ALTER TABLE Merchants
        MODIFY COLUMN id VARCHAR(255) NOT NULL,
        MODIFY COLUMN clientId VARCHAR(255),
        MODIFY COLUMN businessId VARCHAR(255)`);

    await queryInterface.sequelize.query(`
      ALTER TABLE Businesses
          MODIFY COLUMN id VARCHAR(255) NOT NULL`);

    await queryInterface.sequelize.query(`
        ALTER TABLE Clients
          MODIFY COLUMN id VARCHAR(255) NOT NULL,
          MODIFY COLUMN businessId VARCHAR(255)`);

    await queryInterface.sequelize.query(`
        ALTER TABLE identity_provider_mypay_relations
          MODIFY COLUMN  id VARCHAR(255) NOT NULL,
          MODIFY COLUMN userId VARCHAR(255)`);

    await queryInterface.sequelize.query(`
        ALTER TABLE Relationships
          MODIFY COLUMN id VARCHAR(255) NOT NULL,
          MODIFY COLUMN userId VARCHAR(255),
          MODIFY COLUMN businessId VARCHAR(255),
          MODIFY COLUMN clientId VARCHAR(255),
          MODIFY COLUMN merchantId VARCHAR(255),
          MODIFY COLUMN roleId VARCHAR(255)`);

    await queryInterface.sequelize.query(`
      ALTER TABLE Roles
          MODIFY COLUMN id VARCHAR(255) NOT NULL`);

    await queryInterface.sequelize.query(`
        ALTER TABLE Users
          MODIFY COLUMN id VARCHAR(255) NOT NULL,
          MODIFY COLUMN typeId VARCHAR(255)`);

    await queryInterface.sequelize.query(`
        ALTER TABLE user_types
          MODIFY COLUMN id VARCHAR(255) NOT NULL`);

    //Add constraint
    await queryInterface.sequelize.query(
      `ALTER TABLE Merchants ADD CONSTRAINT Merchants_ibfk_1 FOREIGN KEY (clientId) REFERENCES Clients(id)`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE Users ADD CONSTRAINT Users_typeId_foreign_idx FOREIGN KEY (typeId) REFERENCES user_types(id)`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE Relationships ADD CONSTRAINT Relationships_ibfk_1 FOREIGN KEY (businessId) REFERENCES Businesses(id)`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE Relationships ADD CONSTRAINT Relationships_ibfk_2 FOREIGN KEY (clientId) REFERENCES Clients(id)`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE Relationships ADD CONSTRAINT Relationships_ibfk_3 FOREIGN KEY (merchantId) REFERENCES Merchants(id)`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE Relationships ADD CONSTRAINT Relationships_ibfk_4 FOREIGN KEY (userId) REFERENCES Users(id)`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE Relationships ADD CONSTRAINT Relationships_ibfk_5 FOREIGN KEY (roleId) REFERENCES Roles(id)`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE identity_provider_mypay_relations ADD CONSTRAINT identity_provider_mypay_relations_ibfk_1 FOREIGN KEY (userId) REFERENCES Users(id)`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE Clients ADD CONSTRAINT Clients_ibfk_1 FOREIGN KEY (businessId) REFERENCES Businesses(id)`
    );
  },
};
