var {
    response,
    flakeGenerateDecimal,
    getUserId,
    processCardStreamPayment,
    updateStats,
    getAuthorizedMerchantIds
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

const TransactionStatus = {
    SUCCESS: 'SUCCESS'
};
export const createSale = async (event) => {
    const { sequelize } = db;
    const payload = JSON.parse(event.body);
    const requestId = 'reqid_' + flakeGenerateDecimal();
    const transaction = await sequelize.transaction();

    try {
        let params;

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

        let merchant_id = payload.merchant_id;
        if (!merchant_ids.includes(merchant_id)) {
            throw { message: 'Unauthorised user' };
        }

        const pushItemResp = await db.items.create({
            data: JSON.stringify(payload.items)
        });

        const pushShopperResp = await db.shoppers.create({
            first_name: payload.shoppers.first_name,
            last_name: payload.shoppers.last_name,
            email: payload.shoppers.email,
            address: payload.shoppers.address
        });

        let pushTempTransactionResp = await db.temp_transactions.create({
            merchant_id,
            user_order_ref: payload.user_order_ref,
            shopper_id: pushShopperResp.dataValues.id,
            item_id: pushItemResp.dataValues.id,
            amount: payload.amount,
            currency_code: payload.currency_code,
            status: 'IN_PROGRESS'
        });
        const session_id = pushTempTransactionResp.dataValues.id;

        const {
            shopper_id,
            currency_code,
            user_order_ref,
            item_id,
            amount,
            status
        } = pushTempTransactionResp.dataValues;

        params = { temp_transaction_ref: session_id };

        if (!params.temp_transaction_ref) {
            throw { message: 'Something Wrong with this order, Please try again' };
        }

        if (status === TransactionStatus.SUCCESS) {
            throw { message: 'Transaction failed' };
        }

        // fetch the active white labbled service active
        const userSetting = await db.users_settings.findOne({
            where: { merchant_id }
        });

        let shopperInforamtion = await db.shoppers.findOne({
            where: { id: shopper_id }
        });

        // in case of cardstream
        if (userSetting.active_wl_service === ProvidersShortname.CARDSTREAM) {
            // get the user setting based on card stream

            let csSettings = await db.users_cardstream_settings.findOne({
                merchant_id
            });

            // prepare the object for cs
            let cs_payload = {
                action: 'SALE',
                type: 1,
                duplicateDelay: 1,
                amount: amount,
                merchantID: csSettings.cs_merchant_id,
                currencyCode: currency_code, //826
                countryCode: csSettings.country_code, //826
                cardNumber: payload.card_number,
                cardExpiryMonth: payload.card_exp_month,
                cardExpiryYear: payload.card_exp_year,
                cardCVV: payload.card_cvv,
                customerName: shopperInforamtion.first_name + shopperInforamtion.last_name,
                customerAddress: shopperInforamtion.address,
                transactionUnique: session_id
            };
            //check if 3d authentication details has been passed on
            if (
                Object.prototype.hasOwnProperty.call(payload, 'md') &&
                Object.prototype.hasOwnProperty.call(payload, 'paRes')
            ) {
                cs_payload['threeDSMD'] = payload.md;
                cs_payload['threeDSPaRes'] = payload.paRes;
            }

            let cs_response = await processCardStreamPayment(cs_payload, csSettings.signature); //this should be coming from helper library

            //if response is failure
            if (cs_response['responseCode'] === 65802) {
                //since the sale requires a 3d authentication, delete the temp, shopper and items created,
                //as the same will be created again when the calls come back after bank auth
                await deleteTempInfo(
                    { session_id, shopper_id, item_id },
                    { items: db.items, shoppers: db.shoppers, temp_transactions: db.temp_transactions }
                );

                let ThreeDS_response = {
                    statusCode: 201,
                    body: {
                        request_id: requestId,
                        message: 'The request was processed successfully',
                        data: {
                            success: '3d',
                            threeDSreq: {
                                acsUrl: cs_response['threeDSACSURL'],
                                md: cs_response['threeDSMD'],
                                paReq: cs_response['threeDSPaReq']
                            }
                        }
                    }
                };
                return response(ThreeDS_response.body, ThreeDS_response.statusCode);
            } else if (cs_response['responseCode'] !== 0) {
                throw {
                    message: `Transaction failed CS- ${cs_response.responseMessage} - ${cs_response.responseCode}`
                };
            }

            // push the response from the cardstream transaction
            let db_cs_transaction = await db.card_stream_transactions.create({
                action: cs_response.action,
                xref: cs_response.xref,
                raw_response: JSON.stringify(response)
            });

            const { fee_percent } = userSetting;
            const fee = (cs_response.amount * fee_percent) / 10000;
            const net = cs_response.amount - fee;

            // push the transaction to main transaction table
            let pushTransactionResp = await db.transactions.create({
                merchant_id: merchant_id,
                user_order_ref: user_order_ref,
                amount: cs_response.amount,
                fee,
                net,
                currency_code: cs_response.currencyCode,
                shopper_id: shopper_id,
                item_id: item_id,
                provider: userSetting.active_wl_service,
                provider_response_id: db_cs_transaction.dataValues.id,
                last_4digits: `${payload.card_number}`.substr(-4)
            });

            await updateStats(
                {
                    merchant_id,
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

            await db.temp_transactions.update({ status: 'PROCESSED' }, { where: { id: session_id } });

            await transaction.commit();
            return response({
                message: 'The request was processed successfully',
                data: {
                    success: 'ok',
                    transactionRef: pushTransactionResp.dataValues.ref
                }
            });
        } else {
            throw { message: 'No provider found!' };
        }
    } catch (err) {
        await transaction.rollback();
        return response(err.message, 500);
    }
};

let deleteTempInfo = async (params, models) => {
    await models.temp_transactions.destroy({
        where: { id: params.session_id }
    });

    await models.items.destroy({
        where: { id: params.item_id }
    });

    await models.shoppers.destroy({
        where: { id: params.shopper_id }
    });
    Promise.resolve({});
};
