var { response, flakeGenerateDecimal, getUserId, getAuthorizedMerchantIds } = process.env.IS_OFFLINE
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
const HOSTED_FORM_URL = 'https://gateway.mypay.co.uk';
const TemptransactionStatus = {
    IN_PROGRESS: 'IN_PROGRESS'
};
export const sendPayByLink = async (event) => {
    const { sequelize } = db;
    var transaction = await sequelize.transaction();
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

        //create session and send email
        if (!payload.email || !payload.amount || !payload.merchant_id) {
            throw { message: 'Required parameters missing!' };
        }

        let merchant_id = payload.merchant_id;
        if (!merchant_ids.includes(merchant_id)) {
            throw { message: `Merchant authorization failed!` };
        }

        let pushItemResp = await db.items.create({
            data: payload.items ? JSON.stringify(payload.items) : JSON.stringify({ pbl: 'pbl' })
        });

        let pushShopperResp = await db.shoppers.create({
            first_name: payload.first_name ? payload.first_name : 'pbl',
            last_name: payload.last_name ? payload.last_name : 'pbl',
            email: payload.email,
            address: payload.address ? payload.address : 'pbl'
        });

        let metaRef = await db.temp_transactions_meta.create({
            data: payload.meta_data
                ? JSON.stringify(payload.meta_data)
                : JSON.stringify({ from: 'PBL', redirect_url: HOSTED_FORM_URL })
        });

        let pushTempTransactionResp = await db.temp_transactions.create({
            merchant_id,
            user_order_ref: payload.user_order_ref ? payload.user_order_ref : 'pbl',
            shopper_id: pushShopperResp.dataValues.id,
            item_id: pushItemResp.dataValues.id,
            meta_id: metaRef.dataValues.id,
            amount: payload.amount,
            currency_code: payload.currency_code ? payload.currency_code : 826,
            status: TemptransactionStatus.IN_PROGRESS
        });
        let pay_by_link = `${HOSTED_FORM_URL}/${pushTempTransactionResp.dataValues.id}`;
        console.log('pay_by_link', pay_by_link);
        await transaction.commit();
        return response({
            request_id: requestId,
            message: 'success',
            data: {
                pay_by_link
            }
        });
    } catch (err) {
        await transaction.rollback();
        return response({ error_message: err.message }, 500);
    }
};
