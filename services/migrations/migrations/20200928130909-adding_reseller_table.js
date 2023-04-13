'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        let { DataTypes } = Sequelize;

        return queryInterface
            .createTable('resellers', {
                id: {
                    allowNull: false,
                    primaryKey: true,
                    type: DataTypes.BIGINT
                },
                name: {
                    type: DataTypes.STRING,
                    field: 'name'
                },
                logo: {
                    type: DataTypes.STRING,
                    field: 'logo'
                },
                websiteURL: {
                    type: DataTypes.STRING,
                    field: 'website_url'
                },
                contactUsPageURL: {
                    type: DataTypes.STRING,
                    field: 'contact_us_page_url'
                },
                helpPageURL: {
                    type: DataTypes.STRING,
                    field: 'help_page_url'
                },
                created_at: {
                    allowNull: true,
                    type: Sequelize.DATE
                },
                updated_at: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                deleted_at: {
                    allowNull: true,
                    type: Sequelize.DATE
                }
            })
            .then(() =>
                queryInterface
                    .bulkInsert('resellers', [
                        {
                            id: 1,
                            name: 'MyPay',
                            logo: 'MyPay',
                            website_url: 'https://MyPay.co.uk',
                            contact_us_page_url: 'https://mypay.co.uk/contact-us',
                            help_page_url: 'https://mypay.co.uk/help',
                            created_at: new Date(),
                            updated_at: new Date()
                        },
                        {
                            id: 2,
                            name: 'Dummy T2S',
                            logo: 'Dummy T2S',
                            website_url: 'https://MyPay.co.uk',
                            contact_us_page_url: 'https://fake.mypay.co.uk/contact-us',
                            help_page_url: 'https://fake.mypay.co.uk/help',
                            created_at: new Date(),
                            updated_at: new Date()
                        }
                    ])
                    .then(
                        async () =>
                            await queryInterface.addColumn('relationships', 'reseller_id', {
                                type: DataTypes.BIGINT,
                                foreignKey: true,
                                references: {
                                    model: 'resellers',
                                    key: 'id'
                                },
                                defaultValue: 1,
                                allowNull: false
                            })
                    )
            );
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface
            .removeColumn('relationships', 'reseller_id')
            .then(() => queryInterface.dropTable('resellers'));
    }
};
