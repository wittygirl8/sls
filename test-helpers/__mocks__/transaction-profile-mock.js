const TransactionProfileList = [
    {
        id: '6696774094307721216',
        merchant_id: '6691325816564875264',
        is_deposits_taken: true,
        goods: 2,
        card_turnover: 3,
        deposit_far_days: 4,
        no_delivery_days: 0,
        is_pre_payment: true,
        full_pre_payments: 1,
        advance_full_payment_days: 2,
        company_turn_over_actual: 3,
        company_turn_over_projected: 4,
        card_turn_over_actual: 5,
        card_turn_over_projected: 0,
        price_range_min: 7,
        price_range_max: 8,
        price_range_avg: 9,
        is_moto_payment: 20,
        is_max_ticket_applied: true,
        total_card_turnover_is_moto: 123,
        advance_goods_moto_provided_days: 214,
        is_auto_renew_transactions: true,
        reason_for_moto_renewal_id: null,
        created_at: '2020-08-05 13:49:24',
        updated_at: '2020-08-05 15:05:38'
    },
    {
        id: '23424234234234',
        merchant_id: '6346435215435',
        is_deposits_taken: true,
        goods: 8,
        card_turnover: 34,
        deposit_far_days: 234,
        no_delivery_days: 56,
        is_pre_payment: true,
        full_pre_payments: 1,
        advance_full_payment_days: 24,
        company_turn_over_actual: 3,
        company_turn_over_projected: 346,
        card_turn_over_actual: 456,
        card_turn_over_projected: 0,
        price_range_min: 342,
        price_range_max: 8,
        price_range_avg: 23436,
        is_moto_payment: 20,
        is_max_ticket_applied: true,
        total_card_turnover_is_moto: 1323,
        advance_goods_moto_provided_days: 26714,
        is_auto_renew_transactions: true,
        reason_for_moto_renewal_id: null,
        created_at: '2020-08-05 13:49:24',
        updated_at: '2020-08-05 15:05:38'
    }
];

/**
 * @type {{
 * isUpdateDeleteMode: boolean
 * findAllError: boolean
 * destroyError: boolean
 * saveError: boolean
 * }} options
 */
let options = {};

/**
 *
 * @param {{
 * isUpdateDeleteMode: boolean
 * findAllError: boolean
 * findByPkError: boolean
 * destroyError: boolean
 * saveError: boolean
 * updateError: boolean
 * }} opt
 */
const setTransactionProfileOptions = (opt) => {
    options = opt;
};

const resetTransactionProfileOptions = () => {
    options.saveError = false;
    options.isUpdateDeleteMode = false;
    options.findAllError = false;
    options.findByPkError = false;
    options.destroyError = false;
    options.updateError = false;
    options.findOneEntityExists = false;
};

let transactionProfileToUpdateDelete;

const TransactionProfileModel = {
    findByPk: (id) => {
        if (typeof id !== 'string') {
            throw new Error('Sql error');
        }

        if (options.findByPkError) {
            throw new Error('DB error on findByPk');
        }

        if (options.isUpdateDeleteMode) {
            transactionProfileToUpdateDelete = TransactionProfileList.find((address) => address.id == id);
            if (!transactionProfileToUpdateDelete) {
                return null;
            }
            return TransactionProfileModel;
        }
        return TransactionProfileList.find((address) => address.id === id);
    },
    findOne: (param) => {
        if (options.findOneEntityExists) {
            return TransactionProfileList[0];
        }
        if (param.where.id) {
            if (options.isUpdateDeleteMode) {
                transactionProfileToUpdateDelete = TransactionProfileList.find(
                    (address) => address.id == param.where.id
                );
                if (!transactionProfileToUpdateDelete) {
                    return null;
                }
                return TransactionProfileModel;
            }
            return TransactionProfileList.find((address) => address.id === param.where.id);
        }
        return null;
    },
    findAll: () => {
        if (options.findAllError) {
            throw new Error('Sql error');
        }
        return TransactionProfileList;
    },
    count: () => {
        if (options.findOneEntityExists) {
            return 1;
        }
        return 0;
    },
    create: (data) => {
        if (options.saveError) {
            throw new Error('DB exception on save');
        }
        TransactionProfileList.push(data);
    },
    update: (updateData) => {
        if (options.updateError) {
            throw new Error('DB exception on update');
        }
        const updatedAddress = { ...transactionProfileToUpdateDelete, ...updateData };
        const index = TransactionProfileList.indexOf(transactionProfileToUpdateDelete);
        TransactionProfileList[index] = updatedAddress;
    },
    destroy: () => {
        if (options.destroyError) {
            throw new Error('Sql error');
        }
        const index = TransactionProfileList.indexOf(transactionProfileToUpdateDelete);
        TransactionProfileList.splice(index, 1);
    }
};

module.exports = {
    TransactionProfileList,
    setTransactionProfileOptions,
    resetTransactionProfileOptions,
    TransactionProfileModel
};
