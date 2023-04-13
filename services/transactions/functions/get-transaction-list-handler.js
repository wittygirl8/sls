var { response, flakeGenerateDecimal, getUserId, helpers, getAuthorizedMerchantIds } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

const changeCase = require('change-case');

export const listTransactions = async (event) => {
    const { sequelize } = db;
    const payload = JSON.parse(event.body);
    const requestId = 'reqid_' + flakeGenerateDecimal();
    try {
        const userId = await getUserId(event);

        let merchant_ids = await getAuthorizedMerchantIds(
            {
                user_id: userId
            },
            {
                sequelize,
                Relationship: db.Relationship
            }
        );
        merchant_ids = merchant_ids.join("','");
        let [payment] = await gettransactionList(
            {
                ...payload,
                merchant_ids
            },
            sequelize
        );

        let allTotal = 0;
        let totalNumberOfOrder = 0;
        let fees = 0;
        let transformedPayment = payment.map((item) => {
            let total = helpers.formatCurrency(item.amount);
            let first_name = changeCase.sentenceCase(item.first_name);
            let last_name = changeCase.sentenceCase(item.last_name);
            let address = changeCase.sentenceCase(item.address);
            let payed = 0;
            allTotal = parseFloat(allTotal) + parseFloat(total);
            if (parseFloat(item.amount) > 0) {
                totalNumberOfOrder = parseInt(totalNumberOfOrder) + 1;
                fees = parseFloat(fees) + parseFloat(item.fee);
                payed = helpers.formatCurrency(item.amount - item.fee);
            }
            return { ...item, total, payed, first_name, last_name, address };
        });

        return response({
            request_id: requestId,
            data: {
                transactions: transformedPayment,
                total: parseFloat(allTotal).toFixed(2)
            }
        });
    } catch (err) {
        return response(err.message, 500);
    }
};

let gettransactionList = async (params, sequelizeInstance) => {
    const { via, merchant_ids, month, day, year, week } = params;
    if (via == 'DAY') {
        return sequelizeInstance.query(`
          SELECT
          transactions.id as id,
          transactions.merchant_id as merchant_id,
          transactions.user_order_ref as user_order_ref,
          transactions.amount as amount,
          transactions.fee as fee,
          transactions.net as net,
          transactions.currency_code as currency_code,
          transactions.refund_id as refund_id,
          transactions.shopper_id as shopper_id,
          transactions.item_id as item_id,
          transactions.channel as channel,
          transactions.provider as provider,
          transactions.provider_response_id as provider_response_id,
          transactions.created_at as created_at,
          YEAR(transactions.created_at) as year,
          WEEK(transactions.created_at) as week,
          DAY(transactions.created_at) as day,
          MONTH(transactions.created_at) as month,
          shoppers.first_name as first_name,
          shoppers.last_name as last_name,
          shoppers.email as email,
          shoppers.address as address,
          refunds.id as refundRef,
          refunds.amount as refundAmount,
          refunds.reason As refundReason
          from transactions
          JOIN shoppers ON transactions.shopper_id = shoppers.id 
          LEFT JOIN refunds ON transactions.refund_id = refunds.id 
          WHERE (transactions.merchant_id IN ('${merchant_ids}')
                  and MONTH(transactions.created_at)="${month}" 
                  and DAY(transactions.created_at)="${day}" 
                  and YEAR(transactions.created_at)="${year}")
          ORDER BY transactions.id DESC`);
    } else if (via == 'WEEK') {
        return sequelizeInstance.query(`
          SELECT transactions.id As id,
          transactions.id As ref,
          transactions.merchant_id As merchant_id,
          transactions.user_order_ref As user_order_ref,
          transactions.amount As amount,
          transactions.fee As fee,
          transactions.net As net,
          transactions.currency_code As currency_code,
          transactions.refund_id As refund_id,
          transactions.shopper_id As shopper_id,
          transactions.item_id As item_id,
          transactions.channel as channel,
          transactions.provider As provider,
          transactions.provider_response_id As provider_response_id,
          transactions.created_at As created_at,
          YEAR(transactions.created_at) as year,
          WEEK(transactions.created_at) as week,
          DAY(transactions.created_at) as day,
          MONTH(transactions.created_at) as month,
          shoppers.first_name As first_name,
          shoppers.last_name As last_name,
          shoppers.email As email,
          shoppers.address As address,
          refunds.id As refundRef,
          refunds.amount As refundAmount,
          refunds.reason As refundReason
          from transactions JOIN shoppers ON transactions.shopper_id = shoppers.id 
          LEFT JOIN refunds ON transactions.refund_id = refunds.id 
          WHERE (transactions.merchant_id IN ('${merchant_ids}') 
                and WEEK(transactions.created_at)="${week}" 
                and YEAR(transactions.created_at)="${year}" )
          ORDER BY transactions.id DESC`);
    } else if (params.via == 'MONTH') {
        return sequelizeInstance.query(`
          SELECT transactions.id as id,
          transactions.id As ref,
          transactions.merchant_id As merchant_id,
          transactions.user_order_ref As user_order_ref,
          transactions.amount As amount,
          transactions.fee As fee,
          transactions.net As net,
          transactions.currency_code As currency_code,
          transactions.refund_id As refund_id,
          transactions.shopper_id As shopper_id,
          transactions.item_id As item_id,
          transactions.channel as channel,
          transactions.provider As provider,
          transactions.provider_response_id As provider_response_id,
          transactions.created_at As created_at,
          YEAR(transactions.created_at) as year,
          WEEK(transactions.created_at) as week,
          DAY(transactions.created_at) as day,
          MONTH(transactions.created_at) as month,
          shoppers.first_name As first_name,
          shoppers.last_name As last_name,
          shoppers.email As email,
          shoppers.address As address,
          refunds.id As refundRef,
          refunds.amount As refundAmount,
          refunds.reason As refundReason
          from transactions JOIN shoppers ON transactions.shopper_id = shoppers.id 
          LEFT JOIN refunds ON transactions.refund_id = refunds.id 
          WHERE (transactions.merchant_id IN ('${merchant_ids}')
            and MONTH(transactions.created_at)="${month}" 
            and YEAR(transactions.created_at)="${year}" )
          ORDER BY transactions.id DESC`);
    }
};
