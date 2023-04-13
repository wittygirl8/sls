var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);
var { response, flakeGenerateDecimal, getUserId, processCardStreamPayment, getAuthorizedMerchantIds } = process.env
    .IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');

const ProvidersShortname = {
    CARDSTREAM: 'CS'
};

export const refundSale = async (event) => {
    const { sequelize } = db;
    const requestId = 'reqid_' + flakeGenerateDecimal();
    try {
        const payload = JSON.parse(event.body);
        const userId = await getUserId(event);
        //get list of merchant ids
        let merchant_ids = await getAuthorizedMerchantIds(
            {
                user_id: userId
            },
            {
                sequelize,
                Relationship: db.Relationship
            }
        );

        let transactionDetailsData = await db.transactions.findOne({
            where: { id: payload.transaction_id }
        });

        //check if the current merchant_id associated with this transaction_id belongs to the current userId
        let merchant_id = transactionDetailsData.merchant_id;
        if (!merchant_ids.includes(merchant_id)) {
            throw { message: `Invalid transaction id provided` };
        }

        if (!transactionDetailsData) {
            throw { message: `No sales made with this ${payload.tansaction_id} Id.` };
        }

        if (transactionDetailsData.refund_id) {
            throw { message: `Refund has already processed` };
        }

        if (payload.amount > transactionDetailsData.amount) {
            throw { message: `Requested amount is greater than the original amount` };
        }

        // in case of cardstream provider
        if (transactionDetailsData.provider === ProvidersShortname.CARDSTREAM) {
            let csSettings = await db.users_cardstream_settings.findOne({
                where: { merchant_id: merchant_id }
            }); //users_cardstream_settings

            let csTransactionInfo = await db.card_stream_transactions.findOne({
                where: { id: transactionDetailsData.provider_response_id }
            }); //users_cardstream_settings

            let CsResponse = await processCardStreamPayment(
                {
                    action: 'REFUND',
                    amount: payload.amount,
                    merchantID: csSettings.cs_merchant_id,
                    xref: csTransactionInfo.xref
                },
                csSettings.signature
            );

            if (CsResponse.responseCode !== 0) {
                throw {
                    message: `Refund failed - code - ${CsResponse.responseCode} - message - ${CsResponse.responseMessage}`
                };
            }
            // push the response from the cardstream transaction
            let db_cs_refund_transaction = await db.card_stream_transactions.create({
                action: CsResponse.action,
                xref: CsResponse.xref,
                raw_response: JSON.stringify(CsResponse)
            });
            // console.log('db_cs_refund_transaction',db_cs_refund_transaction);return false

            // get the user setting based on card stream
            let userSetting = await db.users_settings.findOne({
                where: {
                    merchant_id: merchant_id,
                    active_wl_service: ProvidersShortname.CARDSTREAM
                }
            });
            // console.log('db_cs_refund_transaction',db_cs_refund_transaction);return false
            const { fee_percent } = userSetting;
            const fee = (CsResponse.amount * fee_percent) / 10000;
            const net = CsResponse.amount - fee;

            // push the transaction to main transaction table
            let pushedRefunded = await db.refunds.create({
                merchant_id: merchant_id,
                amount: CsResponse.amount,
                fee,
                net,
                currency_code: transactionDetailsData.currency_code,
                transaction_id: transactionDetailsData.id,
                provider: transactionDetailsData.provider,
                provider_response_id: db_cs_refund_transaction.dataValues.id,
                reason: payload.reason
            });

            await db.transactions.update({ refund_id: pushedRefunded.id }, { where: { id: payload.transaction_id } });

            await updateRefundStat(
                {
                    merchant_id: merchant_id,
                    refund_amount: CsResponse.amount,
                    refund_fee: fee,
                    refund_net: net,
                    currency_code: transactionDetailsData.currency_code
                },
                {
                    stats: db.stats
                }
            );
            // await transaction.commit();
            return response({
                request_id: requestId,
                data: {
                    message: 'Refund has been been initiated'
                }
            });
        } else {
            throw { message: 'No provider found!' };
        }
    } catch (err) {
        // await transaction.rollback();
        return response(err.message, 500);
    }
};

let updateRefundStat = async (params, models) => {
    const { merchant_id: merchant_id, refund_amount, refund_fee, refund_net, currency_code } = params;

    const currentDayStats = await models.stats.findOne({
        where: { merchant_id, currency_code }
    });

    if (currentDayStats) {
        // update
        return models.stats.update(
            {
                refund_count: currentDayStats.refund_count + 1,
                refund_fee: currentDayStats.refund_fee + refund_fee,
                refund_net: currentDayStats.refund_net + refund_net,
                refund_amount: currentDayStats.refund_amount + refund_amount
            },
            { where: { id: currentDayStats.id } }
        );
    }

    return models.stats.create({
        merchant_id,
        refund_count: 1,
        refund_amount,
        refund_fee,
        refund_net,
        currency_code
    });
};
