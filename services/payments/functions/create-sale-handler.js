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

const ProvidersShortname = {
    CARDSTREAM: 'CS'
};

export const createSale = async (event) => {
    let { sequelize } = db;
    const payload = JSON.parse(event.body);
    const requestId = 'reqid_' + flakeGenerateDecimal();

    // const transaction = await sequelize.transaction();

    try {
        if (!payload.session_id || !payload.cardno || !payload.cvv || !payload.exp_mm || !payload.exp_yy) {
            throw { message: 'Fields missing' };
        }

        // validate session id
        let sessionInfo = await validateSaleSession(
            {
                session_id: payload.session_id
            },
            {
                sequelize,
                temp_transactions: db.temp_transactions
            }
        ); //temp_transactions based on the id

        // get merchant settings
        let userSetting = await db.users_settings.findOne({
            where: { merchant_id: sessionInfo.merchant_id }
        });

        if (userSetting.active_wl_service === ProvidersShortname.CARDSTREAM) {
            //get merchant cardstream based settings
            let csSettings = await db.users_cardstream_settings.findOne({
                merchant_id: sessionInfo.merchant_id
            });

            let shopperInformation = await db.shoppers.findOne({
                where: { id: sessionInfo.shopper_id }
            });

            let metaInfo = await db.temp_transactions_meta.findOne({
                where: { id: sessionInfo.meta_id }
            });

            let cs_response = await createCsTransaction(
                { sessionInfo, userSetting, csSettings, payload, shopperInformation, metaInfo },
                {
                    sequelize,
                    card_stream_transactions: db.card_stream_transactions,
                    transactions: db.transactions,
                    temp_transactions: db.temp_transactions,
                    Merchant: db.Merchant,
                    stats: db.stats
                },
                requestId
            );
            // await transaction.commit();
            return response(cs_response.body, cs_response.statusCode);
        } else {
            throw { message: 'Provider not found' };
        }
    } catch (err) {
        // await transaction.rollback();
        return response(err.message, 500);
    }
};

let createCsTransaction = async (params, models, requestId = '') => {
    const { sessionInfo, userSetting, csSettings, payload, shopperInformation, metaInfo } = params;
    // prepare the object for cs
    let cs_payload = {
        action: 'SALE',
        type: 1,
        duplicateDelay: 1,
        amount: sessionInfo.amount,
        merchantID: csSettings.cs_merchant_id,
        currencyCode: sessionInfo.currency_code, //826
        countryCode: csSettings.country_code, //826
        cardNumber: payload.cardno,
        cardExpiryMonth: payload.exp_mm,
        cardExpiryYear: payload.exp_yy,
        cardCVV: payload.cvv,
        customerName: shopperInformation.first_name + shopperInformation.last_name,
        customerAddress: shopperInformation.address,
        transactionUnique: sessionInfo.id
    };

    let response = await processCardStreamPayment(cs_payload, csSettings.signature);
    //if response is failure
    if (response['responseCode'] === 65802) {
        //return response back for 3d transaction
        return {
            statusCode: 201,
            body: {
                request_id: requestId,
                message: 'Requires 3d authentication',
                data: {
                    success: '3d',
                    threeDSreq: {
                        acsUrl: response['threeDSACSURL'],
                        md: response['threeDSMD'],
                        paReq: response['threeDSPaReq'],
                        termUrl: process.env.BANK_REDIRECT_URL + '?mid=' + sessionInfo.merchant_id
                    }
                }
            }
        };
    } else if (response['responseCode'] !== 0) {
        //something wrong happened with card stream api
        // throw({message:'Transaction failed: CS-' + response.responseMessage + '-' + response.responseCode})
        //getting redirect url from metaInfo and
        let redirect_info = await getRedirectInfo(
            {
                metaData: JSON.parse(metaInfo.data),
                errorInfo: {
                    code: 700002,
                    message: response.responseMessage
                }
            },
            'ERROR'
        );

        return {
            statusCode: 500,
            body: {
                request_id: requestId,
                message: 'Transaction Request failed',
                data: {
                    redirect_info
                }
            }
        };
    }

    // push the response from the cardstream transaction
    let db_cs_transaction = await models.card_stream_transactions.create({
        action: response.action,
        xref: response.xref,
        raw_response: JSON.stringify(response)
    });

    // create an object for transaction

    const { fee_percent } = userSetting;
    const fee = (response.amount * fee_percent) / 10000;
    const net = response.amount - fee;

    let transactionObject = {
        merchant_id: sessionInfo.merchant_id,
        user_order_ref: sessionInfo.user_order_ref,
        amount: response.amount,
        fee,
        net,
        currency_code: response.currencyCode,
        shopper_id: sessionInfo.shopper_id,
        item_id: sessionInfo.item_id,
        provider: userSetting.active_wl_service,
        provider_response_id: db_cs_transaction.dataValues.id,
        last_4digits: `${payload.cardno}`.substr(-4)
    };
    // push the transaction to main transaction table
    let TransactionInfo = await models.transactions.create(transactionObject);

    await updateStats(
        {
            merchant_id: sessionInfo.merchant_id,
            sale_amount: response.amount,
            sale_fee: fee,
            sale_net: net,
            currency_code: response.currencyCode
        },
        {
            sequelize: models.sequelize,
            stats: models.stats
        }
    );

    await models.temp_transactions.update(
        { status: 'PROCESSED' },
        {
            where: { id: sessionInfo.id }
        }
    );

    const merchantInfo = await models.Merchant.findOne({
        attributes: ['name'],
        where: { id: sessionInfo.merchant_id }
    });

    //sending payment confirmation email to payer
    let confirmation_message = `<h1>Hi ${shopperInformation.first_name},</h1><p>Your payment of <b>&pound; ${(
        sessionInfo.amount / 100
    ).toFixed(2)}</b>&nbsp; to <b>${
        merchantInfo.name
    }</b> has been successfully received.<br> <br> Please note your transaction reference <span style="color: #3869D4; font-weight: 300;"> ${
        TransactionInfo.dataValues.id
    } </span> </p>`;
    await sendEmail({
        email: shopperInformation.email,
        subject: 'Order confirmation',
        message: confirmation_message
    });

    //getting redirect url from metaInfo
    let redirect_info = await getRedirectInfo({
        metaData: JSON.parse(metaInfo.data),
        sessionInfo,
        transacRef: TransactionInfo.dataValues.id
    });
    //return success response for non-3d transactions
    return {
        statusCode: 200,
        body: {
            message: 'success',
            data: {
                transaction_id: TransactionInfo.dataValues.id,
                redirect_info
            }
        }
    };
};
