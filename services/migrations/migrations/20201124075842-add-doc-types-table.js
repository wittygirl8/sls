'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.createTable(
                'document_types',
                {
                    id: {
                        type: Sequelize.INTEGER,
                        primaryKey: true,
                        autoIncrement: true
                    },
                    name: {
                        type: Sequelize.STRING
                    },
                    created_at: {
                        type: Sequelize.DATE,
                        allowNull: false
                    },
                    updated_at: {
                        type: Sequelize.DATE,
                        allowNull: false
                    }
                },
                { transaction: transaction }
            );

            await queryInterface.addColumn(
                'documents',
                'doc_type_id',
                {
                    type: Sequelize.INTEGER,
                    foreignKey: true,
                    references: {
                        model: 'document_types',
                        key: 'id'
                    }
                },
                { transaction: transaction }
            );

            await queryInterface.bulkInsert(
                'document_types',
                [
                    {
                        id: 1,
                        name: 'Bank statement',
                        created_at: new Date(),
                        updated_at: new Date()
                    },
                    {
                        id: 2,
                        name: 'Business rates bill',
                        created_at: new Date(),
                        updated_at: new Date()
                    },
                    {
                        id: 3,
                        name: 'Driving license',
                        created_at: new Date(),
                        updated_at: new Date()
                    },
                    {
                        id: 4,
                        name: 'Passport',
                        created_at: new Date(),
                        updated_at: new Date()
                    },
                    {
                        id: 5,
                        name: 'Rental agreement',
                        created_at: new Date(),
                        updated_at: new Date()
                    },
                    {
                        id: 6,
                        name: 'Residency permit',
                        created_at: new Date(),
                        updated_at: new Date()
                    },
                    {
                        id: 7,
                        name: 'Utility bill',
                        created_at: new Date(),
                        updated_at: new Date()
                    },
                    {
                        id: 8,
                        name: 'Void cheque',
                        created_at: new Date(),
                        updated_at: new Date()
                    }
                ],
                { transaction: transaction }
            );

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.removeColumn('documents', 'doc_type_id');
            await queryInterface.dropTable('document_types');

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
        }
    }
};
