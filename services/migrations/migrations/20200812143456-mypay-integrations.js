'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface
            .createTable('items', {
                id: {
                    type: Sequelize.BIGINT,
                    allowNull: false,
                    primaryKey: true
                },
                data: {
                    type: Sequelize.STRING,
                    defaultValue: null
                },
                created_at: {
                    type: 'TIMESTAMP',
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                    allowNull: false
                },
                updated_at: {
                    type: 'TIMESTAMP',
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
                    allowNull: false
                }
            })
            .then(() =>
                queryInterface.createTable('shoppers', {
                    id: {
                        type: Sequelize.BIGINT,
                        allowNull: false,
                        primaryKey: true
                    },
                    first_name: {
                        type: Sequelize.STRING,
                        allowNull: false
                    },
                    last_name: {
                        type: Sequelize.STRING,
                        allowNull: false
                    },
                    email: {
                        type: Sequelize.STRING,
                        allowNull: false
                    },
                    address: {
                        type: Sequelize.STRING,
                        defaultValue: null
                    },
                    created_at: {
                        type: 'TIMESTAMP',
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                        allowNull: false
                    },
                    updated_at: {
                        type: 'TIMESTAMP',
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
                        allowNull: false
                    }
                })
            )
            .then(() =>
                queryInterface.createTable('security_credentials', {
                    id: {
                        type: Sequelize.BIGINT,
                        allowNull: false,
                        primaryKey: true
                    },
                    access_key: {
                        type: Sequelize.STRING,
                        allowNull: false
                    },
                    secret_key: {
                        type: Sequelize.STRING,
                        allowNull: false
                    },
                    merchant_id: {
                        type: Sequelize.BIGINT,
                        allowNull: false,
                        references: {
                            model: 'merchants',
                            key: 'id'
                        }
                    },
                    created_at: {
                        type: 'TIMESTAMP',
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                        allowNull: false
                    },
                    updated_at: {
                        type: 'TIMESTAMP',
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
                        allowNull: false
                    }
                })
            )
            .then(() =>
                queryInterface.createTable('transactions', {
                    id: {
                        type: Sequelize.BIGINT,
                        allowNull: false,
                        primaryKey: true
                    },
                    merchant_id: {
                        type: Sequelize.BIGINT,
                        defaultValue: null,
                        references: {
                            model: 'merchants',
                            key: 'id'
                        }
                    },
                    user_order_ref: {
                        type: Sequelize.STRING,
                        defaultValue: null
                    },
                    amount: {
                        type: Sequelize.INTEGER,
                        allowNull: false
                    },
                    fee: {
                        type: Sequelize.INTEGER,
                        allowNull: false
                    },
                    net: {
                        type: Sequelize.INTEGER,
                        allowNull: false
                    },
                    currency_code: {
                        type: Sequelize.STRING, //currency code can start with zero, hence string datatype chosen
                        allowNull: false
                    },
                    refund_id: {
                        type: Sequelize.BIGINT
                        //   references: {
                        //     model:'refunds',
                        //     key: 'id'
                        //   }
                    },
                    shopper_id: {
                        type: Sequelize.BIGINT,
                        references: {
                            model: 'shoppers',
                            key: 'id'
                        }
                    },
                    item_id: {
                        type: Sequelize.BIGINT,
                        references: {
                            model: 'items',
                            key: 'id'
                        }
                    },
                    provider: {
                        type: Sequelize.ENUM,
                        values: ['CS']
                    },
                    provider_response_id: {
                        type: Sequelize.BIGINT,
                        allowNull: false
                    },
                    user_agent_id: {
                        type: Sequelize.BIGINT,
                        defaulValue: null
                    },
                    last_4digits: {
                        type: Sequelize.STRING, //card number could start with zero, thats why STRING chosen
                        defaultValue: null
                    },
                    created_at: {
                        type: 'TIMESTAMP',
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                        allowNull: false
                    },
                    updated_at: {
                        type: 'TIMESTAMP',
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
                        allowNull: false
                    }
                })
            )
            .then(() =>
                queryInterface.createTable('refunds', {
                    id: {
                        type: Sequelize.BIGINT,
                        allowNull: false,
                        primaryKey: true
                    },
                    merchant_id: {
                        type: Sequelize.BIGINT,
                        references: {
                            model: 'merchants',
                            key: 'id'
                        }
                    },
                    amount: {
                        type: Sequelize.INTEGER,
                        allowNull: false
                    },
                    fee: {
                        type: Sequelize.INTEGER,
                        defaultValue: null
                    },
                    net: {
                        type: Sequelize.INTEGER,
                        defaultValue: null
                    },
                    currency_code: {
                        type: Sequelize.INTEGER(4),
                        allowNull: false
                    },
                    transaction_id: {
                        type: Sequelize.BIGINT,
                        allowNull: true,
                        references: {
                            model: 'transactions',
                            key: 'id'
                        }
                    },
                    provider: {
                        type: Sequelize.ENUM,
                        values: ['CS']
                    },
                    provider_response_id: {
                        type: Sequelize.BIGINT,
                        allowNull: false
                    },
                    reason: {
                        type: Sequelize.STRING,
                        allowNull: false
                    },
                    created_at: {
                        type: Sequelize.DATE,
                        allowNull: false,
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
                    },
                    updated_at: {
                        type: Sequelize.DATE,
                        allowNull: false,
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
                    }
                })
            )

            .then(() =>
                queryInterface.createTable('stats', {
                    id: {
                        type: Sequelize.BIGINT,
                        allowNull: false,
                        primaryKey: true
                    },
                    merchant_id: {
                        type: Sequelize.BIGINT,
                        defaultValue: null,
                        references: {
                            model: 'merchants',
                            key: 'id'
                        }
                    },
                    sale_count: {
                        type: Sequelize.INTEGER
                    },
                    sale_amount: {
                        type: Sequelize.INTEGER
                    },
                    sale_fee: {
                        type: Sequelize.INTEGER
                    },
                    sale_net: {
                        type: Sequelize.INTEGER
                    },
                    refund_count: {
                        type: Sequelize.INTEGER
                    },
                    refund_amount: {
                        type: Sequelize.INTEGER
                    },
                    refund_fee: {
                        type: Sequelize.INTEGER
                    },
                    refund_net: {
                        type: Sequelize.INTEGER
                    },
                    currency_code: {
                        type: Sequelize.STRING
                    },
                    created_at: {
                        type: 'TIMESTAMP',
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                        allowNull: false
                    },
                    updated_at: {
                        type: 'TIMESTAMP',
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
                        allowNull: false
                    }
                })
            )
            .then(() =>
                queryInterface.createTable('temp_transactions_meta', {
                    id: {
                        type: Sequelize.BIGINT,
                        allowNull: false,
                        primaryKey: true
                    },
                    data: {
                        type: Sequelize.STRING,
                        allowNull: false
                    },
                    created_at: {
                        type: 'TIMESTAMP',
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                        allowNull: false
                    },
                    updated_at: {
                        type: 'TIMESTAMP',
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
                        allowNull: false
                    }
                })
            )
            .then(() =>
                queryInterface.createTable('temp_transactions', {
                    id: {
                        type: Sequelize.BIGINT,
                        allowNull: false,
                        primaryKey: true
                    },
                    merchant_id: {
                        type: Sequelize.BIGINT,
                        defaultValue: null,
                        references: {
                            model: 'merchants',
                            key: 'id'
                        }
                    },
                    user_order_ref: {
                        type: Sequelize.STRING,
                        allowNull: false
                    },
                    shopper_id: {
                        type: Sequelize.BIGINT,
                        defaultValue: null,
                        references: {
                            model: 'shoppers',
                            key: 'id'
                        }
                    },
                    item_id: {
                        type: Sequelize.BIGINT,
                        defaultValue: null,
                        references: {
                            model: 'items',
                            key: 'id'
                        }
                    },
                    meta_id: {
                        type: Sequelize.BIGINT,
                        defaultValue: null,
                        references: {
                            model: 'temp_transactions_meta',
                            key: 'id'
                        }
                    },
                    amount: {
                        type: Sequelize.INTEGER,
                        allowNull: false
                    },
                    currency_code: {
                        type: Sequelize.STRING, //some currency code could starts with '0', thats why string chosen
                        allowNull: false
                    },
                    status: {
                        type: Sequelize.ENUM,
                        values: ['IN_PROGRESS', 'PROCESSED']
                    },
                    created_at: {
                        type: 'TIMESTAMP',
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                        allowNull: false
                    },
                    updated_at: {
                        type: 'TIMESTAMP',
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
                        allowNull: false
                    }
                })
            )

            .then(() =>
                queryInterface.createTable('users_cardstream_settings', {
                    id: {
                        type: Sequelize.BIGINT,
                        allowNull: false,
                        primaryKey: true
                    },
                    merchant_id: {
                        type: Sequelize.BIGINT,
                        defaultValue: null,
                        references: {
                            model: 'merchants',
                            key: 'id'
                        }
                    },
                    cs_merchant_id: {
                        type: Sequelize.BIGINT,
                        allowNull: false
                    },
                    country_code: {
                        type: Sequelize.STRING, //could start wtih zeror
                        allowNull: false
                    },
                    currency_code: {
                        type: Sequelize.STRING, //could start with zero
                        allowNull: false
                    },
                    signature: {
                        type: Sequelize.STRING, //could start with zero
                        allowNull: false
                    },
                    created_at: {
                        type: 'TIMESTAMP',
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                        allowNull: false
                    },
                    updated_at: {
                        type: 'TIMESTAMP',
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
                        allowNull: false
                    }
                })
            )
            .then(() =>
                queryInterface.createTable('users_settings', {
                    id: {
                        type: Sequelize.BIGINT,
                        allowNull: false,
                        primaryKey: true
                    },
                    active_wl_service: {
                        type: Sequelize.ENUM,
                        values: ['CS']
                    },
                    merchant_id: {
                        type: Sequelize.BIGINT,
                        defaultValue: null,
                        references: {
                            model: 'merchants',
                            key: 'id'
                        }
                    },
                    fee_percent: {
                        type: Sequelize.INTEGER
                    },
                    progress_status: {
                        type: Sequelize.ENUM,
                        values: ['FRESH', 'REGISTERED', 'ACTIVE']
                    },
                    created_at: {
                        type: 'TIMESTAMP',
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                        allowNull: false
                    },
                    updated_at: {
                        type: 'TIMESTAMP',
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
                        allowNull: false
                    }
                })
            )
            .then(() =>
                queryInterface.createTable('card_stream_transactions', {
                    id: {
                        type: Sequelize.BIGINT,
                        allowNull: false,
                        primaryKey: true
                    },
                    action: {
                        type: Sequelize.STRING
                    },
                    raw_response: {
                        type: Sequelize.TEXT
                    },
                    xref: {
                        type: Sequelize.STRING
                    },
                    created_at: {
                        type: 'TIMESTAMP',
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                        allowNull: false
                    },
                    updated_at: {
                        type: 'TIMESTAMP',
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
                        allowNull: false
                    }
                })
            )
            .then(() =>
                queryInterface.createTable('email_request_log', {
                    id: {
                        type: Sequelize.BIGINT,
                        allowNull: false,
                        primaryKey: true
                    },
                    encryptdata: {
                        type: Sequelize.STRING
                    },
                    merchant_id: {
                        type: Sequelize.BIGINT,
                        allowNull: false
                    },
                    email_ref: {
                        type: Sequelize.STRING
                    },
                    temp_trans_id: {
                        type: Sequelize.BIGINT,
                        defaultValue: null
                    },
                    data: {
                        type: Sequelize.STRING
                    },
                    status: {
                        type: Sequelize.ENUM,
                        values: ['PENDING', 'PROCESSED']
                    },
                    created_at: {
                        type: 'TIMESTAMP',
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                        allowNull: false
                    },
                    updated_at: {
                        type: 'TIMESTAMP',
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
                        allowNull: false
                    }
                })
            );
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface
            .dropTable('refunds')
            .then(() => queryInterface.dropTable('stats'))
            .then(() => queryInterface.dropTable('transactions'))
            .then(() => queryInterface.dropTable('temp_transactions'))
            .then(() => queryInterface.dropTable('items'))
            .then(() => queryInterface.dropTable('shoppers'))
            .then(() => queryInterface.dropTable('security_credentials'))
            .then(() => queryInterface.dropTable('temp_transactions_meta'))
            .then(() => queryInterface.dropTable('users_cardstream_settings'))
            .then(() => queryInterface.dropTable('users_settings'))
            .then(() => queryInterface.dropTable('card_stream_transactions'))
            .then(() => queryInterface.dropTable('email_request_log'));
    }
};
