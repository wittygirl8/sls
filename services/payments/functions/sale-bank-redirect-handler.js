var {
    response,
    flakeGenerateDecimal,
    validateSaleSession,
    processCardStreamPayment,
    updateStats,
    getRedirectInfo,
    sendEmail
} = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

const queryString = require('query-string');
const succesthreeDSAuthenticatStatus = 'Y';
const FRONTEND_REDIRECT_URL = 'https://gateway.mypay.co.uk/redirect';

export const redirectSaleBank = async (event) => {
    const { sequelize } = db;

    const requestId = 'reqid_' + flakeGenerateDecimal();
    const transaction = await sequelize.transaction();

    try {
        const payload = queryString.parse(event.body, { parseNumbers: true });
        const merchant_id = event.queryStringParameters.mid;

        //getting cs signature stored in the db
        let csSettings = await db.users_cardstream_settings.findOne({
            where: { merchant_id }
        });
        if (!csSettings || !csSettings.api_key) {
            throw { message: 'Transaction could not be processed! (Key missing)' };
        }

        //process cardstream transaction
        let cs_response = await processCardStreamPayment(
            {
                threeDSMD: payload.MD,
                threeDSPaRes: payload.PaRes
            },
            csSettings.signature
        ); //to be fetch from library

        let sessionInfo = await validateSaleSession(
            {
                //its already available under create sale js file
                session_id: cs_response.transactionUnique
            },
            {
                sequelize,
                temp_transactions: db.temp_transactions
            }
        );

        let metaInfo = await db.temp_transactions_meta.findOne({
            where: { id: sessionInfo.meta_id }
        });
        let redirect_info;
        //if success, update the dp and give back success
        if (cs_response.responseCode === 0 && cs_response.threeDSAuthenticated === succesthreeDSAuthenticatStatus) {
            //log response
            let db_cs_transaction = await db.card_stream_transactions.create({
                action: cs_response.action,
                xref: cs_response.xref,
                raw_response: JSON.stringify(response)
            });

            let userSetting = await db.users_settings.findOne({
                where: { merchant_id: sessionInfo.merchant_id }
            });

            let shopperInformation = await db.Shopper.findOne({
                where: { id: sessionInfo.shopper_id }
            });

            const { fee_percent } = userSetting;
            const fee = (cs_response.amount * fee_percent) / 10000;
            const net = cs_response.amount - fee;
            // push the transaction to main transaction table
            let TransactionInfo = await db.transactions.create({
                merchant_id: sessionInfo.merchant_id,
                user_order_ref: sessionInfo.user_order_ref,
                amount: cs_response.amount,
                fee,
                net,
                currency_code: cs_response.currencyCode,
                shopper_id: sessionInfo.shopper_id,
                item_id: sessionInfo.item_id,
                provider: userSetting.active_wl_service,
                provider_response_id: db_cs_transaction.dataValues.id,
                last4Digit: `${cs_response.cardNumberMask}`.substr(-4)
            });
            const transactionId = TransactionInfo.id;

            await updateStats(
                {
                    merchant_id: sessionInfo.merchant_id,
                    sale_amount: cs_response.amount,
                    sale_fee: fee,
                    sale_net: net,
                    currency_code: cs_response.currencyCode
                },
                {
                    sequelize,
                    stats: db.stats
                }
            );

            await db.temp_transactions.update(
                { status: 'PROCESSED' },
                {
                    where: { id: sessionInfo.id }
                }
            );

            const merchantInfo = await db.Merchant.findOne({
                where: { id: sessionInfo.merchant_id }
            });

            //sending payment confirmation email to payer
            let confirmation_message = `<h1>Hi ${shopperInformation.first_name},</h1><p>Your payment of <b>&pound; ${(
                sessionInfo.amount / 100
            ).toFixed(2)}</b>&nbsp; to <b>${
                merchantInfo.merchant_name
            }</b> has been successfully received.<br> <br> Please note your transaction reference <span style="color: #3869D4; font-weight: 300;"> ${
                TransactionInfo.dataValues.id
            } </span> </p>`;
            await sendEmail({
                email: shopperInformation.email,
                subject: 'Order confirmation',
                message: confirmation_message
            });

            //getting redirect url from metaInfo
            redirect_info = await getRedirectInfo({
                metaData: JSON.parse(metaInfo.data),
                sessionInfo,
                transactionId
            });

            redirect_info = Buffer.from(JSON.stringify(redirect_info)).toString('base64');
        } else {
            redirect_info = await getRedirectInfo(
                {
                    //this should be available under helper directory
                    metaData: JSON.parse(metaInfo.data),
                    errorInfo: {
                        code: 700001,
                        message: `${cs_response.responseCode}'-'${cs_response.responseMessage}'-'${cs_response.threeDSAuthenticated}`
                    }
                },
                'ERROR'
            );

            redirect_info = Buffer.from(JSON.stringify(redirect_info)).toString('base64');
        }

        await transaction.commit();
        return response(
            {
                request_id: requestId,
                message: 'success',
                data: {}
            },
            301,
            {
                Location: FRONTEND_REDIRECT_URL + '/' + encodeURIComponent(redirect_info)
            }
        );
    } catch (err) {
        await transaction.rollback();
        return response(err.message, 500);
    }
};
