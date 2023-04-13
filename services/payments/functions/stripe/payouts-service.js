require('dotenv').config();

var { response, middy, userAccessValidatorMiddleware } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');

var { connectDB } = process.env.IS_OFFLINE ? require('../../../../layers/models_lib/src') : require('models');
const { MerchantRepo } = require('../../../../libs/repo');
const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

let stripeCredentials = JSON.parse(process.env.STRIPE_CREDENTIALS);
const { stripeAccountMap } = require('../../helpers/stripeAccountMap');

const merchantRepo = new MerchantRepo(db);

export const fetchStripePayouts = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;

        let merchant = await merchantRepo.findOne({
            where: {
                id: merchantId
            },
            attributes: ['id', 'stripeAccountType', 'stripeId']
        });

        if (!merchant) {
            return response({}, 404);
        }
        const stripeAccountType = stripeAccountMap[merchant.stripeAccountType];
        const stripe = require('stripe')(stripeCredentials[stripeAccountType].sk);

        if (!merchant?.stripeId) {
            return response({ data: [] }, 200);
        }
        let list = await stripe.payouts.list({ limit: 100 }, { stripeAccount: merchant.stripeId });

        return response(list, 200);
    } catch (error) {
        console.log(error);
        return response({ error }, 500);
    }
}).use(userAccessValidatorMiddleware());

export const fetchStripePayoutTransactions = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;
        const payoutId = event.pathParameters.payoutId;

        let merchant = await merchantRepo.findOne({
            where: {
                id: merchantId
            },
            attributes: ['id', 'stripeAccountType', 'stripeId']
        });

        if (!merchant) {
            return response({}, 404);
        }
        const stripeAccountType = merchant.stripeAccountType === 'EAT-APPY' ? 'eatappy' : 'datman';
        const stripe = require('stripe')(stripeCredentials[stripeAccountType].sk);

        let list = await stripe.balanceTransactions.list(
            { payout: payoutId, limit: 100 },
            { stripe_account: merchant.stripeId }
        );
        if (list.has_more) {
            let remainingTransactions = await getMoreTransactions(
                stripe,
                payoutId,
                merchant.stripeId,
                list.data[list.data.length - 1].id
            );
            list.data = list.data.concat(remainingTransactions);
        }

        return response(list, 200);
    } catch (error) {
        console.log(error);
        return response({ error }, 500);
    }
}).use(userAccessValidatorMiddleware());

async function getMoreTransactions(stripe, payoutId, stripe_acc_id, starting_after) {
    let list = await stripe.balanceTransactions.list(
        { payout: payoutId, limit: 100, starting_after: starting_after },
        { stripe_account: stripe_acc_id }
    );
    if (list.has_more) {
        return list.data.concat(
            await getMoreTransactions(stripe, payoutId, stripe_acc_id, list.data[list.data.length - 1].id)
        );
    } else {
        return list.data;
    }
}
