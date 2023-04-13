'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('moto_renewal_reason', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        await queryInterface.bulkInsert('moto_renewal_reason', [
            {
                id: 1,
                name: 'Renewal Reason 1',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: 2,
                name: 'Renewal Reason 2',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: 3,
                name: 'Renewal Reason 3',
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);

        await queryInterface.createTable('transaction_profile', {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true
            },
            merchant_id: {
                type: Sequelize.BIGINT,
                references: {
                    key: 'id',
                    allowNull: false,
                    model: 'merchants'
                }
            },
            is_deposits_taken: {
                type: Sequelize.BOOLEAN
            },
            goods: {
                type: Sequelize.INTEGER
            },
            card_turnover: {
                type: Sequelize.INTEGER
            },
            deposit_far_days: {
                type: Sequelize.INTEGER
            },
            no_delivery_days: {
                type: Sequelize.INTEGER
            },
            is_pre_payment: {
                type: Sequelize.BOOLEAN
            },
            full_pre_payments: {
                type: Sequelize.INTEGER
            },
            advance_full_payment_days: {
                type: Sequelize.INTEGER
            },
            company_turn_over_actual: {
                type: Sequelize.INTEGER
            },
            company_turn_over_projected: {
                type: Sequelize.INTEGER
            },
            card_turn_over_actual: {
                type: Sequelize.INTEGER
            },
            card_turn_over_projected: {
                type: Sequelize.INTEGER
            },
            price_range_min: {
                type: Sequelize.INTEGER
            },
            price_range_max: {
                type: Sequelize.INTEGER
            },
            price_range_avg: {
                type: Sequelize.INTEGER
            },
            is_moto_payment: {
                type: Sequelize.BOOLEAN
            },
            is_max_ticket_applied: {
                type: Sequelize.BOOLEAN
            },
            total_card_turnover_is_moto: {
                type: Sequelize.INTEGER
            },
            advance_goods_moto_provided_days: {
                type: Sequelize.INTEGER
            },
            is_auto_renew_transactions: {
                type: Sequelize.BOOLEAN
            },
            reason_for_moto_renewal_id: {
                type: Sequelize.INTEGER,
                references: {
                    key: 'id',
                    allowNull: false,
                    model: 'moto_renewal_reason'
                }
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('transaction_profile');
        await queryInterface.dropTable('moto_renewal_reason');
    }
};
