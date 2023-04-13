require('dotenv').config();

var { response } = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');

var { connectDB } = process.env.IS_OFFLINE ? require('../../../../layers/models_lib/src') : require('models');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

const stripeCredentials = JSON.parse(process.env.STRIPE_CREDENTIALS);
const { stripeAccountMap } = require('../../helpers/stripeAccountMap');

export const accountBalance = async (event) => {
    try {
        const merchantId = event.pathParameters.id;

        const merchant = await await db.Merchant.findOne({
            where: {
                id: merchantId
            }
        });
        if (!merchant) {
            return response({}, 404);
        }
        const stripeAccountType = stripeAccountMap[merchant.stripeAccountType];
        const stripe = require('stripe')(stripeCredentials[stripeAccountType].sk);

        const balance = await stripe.balance.retrieve({
            stripeAccount: merchant.stripeId.trim()
        });
        const availableBalance = balance.available.reduce(function (available, payment) {
            return available + payment['amount'];
        }, 0);
        const pendingBalance = balance.pending.reduce(function (pending, payment) {
            return pending + payment['amount'];
        }, 0);
        return response({ availableBalance, pendingBalance }, 200);
    } catch (err) {
        console.log(err);
        return response({}, 500);
    }
};
