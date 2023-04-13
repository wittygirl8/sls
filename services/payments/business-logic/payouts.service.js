import Axios from 'axios';
const moment = require('moment');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const { MerchantRepo } = require('../../../libs/repo');
const { ResellerNameAndId } = require('../../documents/utils/reseller-name-and-id');
const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);
const datmanAPIEndpoint = process.env.DATMAN_API_ENDPOINT;
let stripeCredentials = JSON.parse(process.env.STRIPE_CREDENTIALS);
const { AcquirersNameMap } = require('../helpers/acquirers');
const { stripeAccountMap } = require('../helpers/stripeAccountMap');
const merchantRepo = new MerchantRepo(db);
const base64 = require('base-64');
const utf8 = require('utf8');

export class PayoutsService {
    async getPayouts(event, merchantId, body) {
        const selectedDate = body.selectedDate;
        const resellerId = body.resellerId;
        const isOmnipay = Number(resellerId) === ResellerNameAndId.OMNIPAY ? true : false;
        const month = moment(selectedDate, 'YYYY-MM').month() + 1;
        const year = moment(selectedDate, 'YYYY-MM').year();
        var data = JSON.stringify({ merchantId: merchantId, month: month, year: year, via: 'MONTH' });
        var dnaPayload = JSON.stringify({ month: month, year: year });

        const merchant = await merchantRepo.findOne({ where: { id: merchantId } });

        let dnaResponse;
        let response;

        if (!merchant) return null;

        const axios = Axios.create();
        const bytes = utf8.encode(merchantId.toString());
        var encodedMerchantId = base64.encode(bytes);
        const token = event.headers['Authorization'] || event.headers['authorization'];

        if (isOmnipay) {
            var dnaConfig = {
                method: 'post',
                url: `${datmanAPIEndpoint}/portal/dna_transactions`,
                headers: {
                    Authorization: token + '!!!' + encodedMerchantId,
                    'Content-Type': 'application/json'
                },
                data: dnaPayload
            };
            dnaResponse = await axios(dnaConfig);
        } else {
            var config = {
                method: 'post',
                url: `${datmanAPIEndpoint}/portal/withdrawalsV2`,
                headers: {
                    Authorization: token + '!!!' + encodedMerchantId,
                    'Content-Type': 'application/json'
                },
                data: data
            };
            response = await axios(config);
        }

        const payoutResult = response?.data.data;
        let dnaPayoutsResult = dnaResponse?.data ? dnaResponse?.data : [];
        let inBatchpayouts = [];
        let notInBatchPayouts = [];
        if (payoutResult && payoutResult.length !== 0) {
            payoutResult.forEach((payout) => {
                if (payout.provider === AcquirersNameMap.DATMAN) {
                    const datmanInBatchPayouts = payout.transaction_data.in_batch?.map((transactions) => {
                        return {
                            ...transactions,
                            batch_items: transactions.batch_items.map((batch_item) => {
                                return {
                                    ...batch_item,
                                    provider: payout.provider
                                };
                            }),
                            provider: payout.provider
                        };
                    });

                    if (
                        moment(selectedDate, 'YYYY-MM-DD').isSame(new Date(), 'month') &&
                        payout.transaction_data.not_in_batch.length !== 0
                    ) {
                        const datmanNotInBatchPayouts = payout.transaction_data.not_in_batch?.map((transactions) => {
                            return {
                                ...transactions,
                                provider: payout.provider
                            };
                        });

                        const notInBatch = getFormattedNotInBatchPayoutsSets(datmanNotInBatchPayouts, payout.provider);
                        notInBatchPayouts = notInBatchPayouts.concat(notInBatch);
                    }
                    inBatchpayouts = inBatchpayouts.concat(datmanInBatchPayouts);
                }
                if (payout.provider === AcquirersNameMap['CARDSTREAM-CH']) {
                    const cardstreamChPayouts = payout.transaction_data.in_batch?.map((transactions) => {
                        return {
                            ...transactions,
                            batch_items: transactions.batch_items.map((batch_item) => {
                                return {
                                    ...batch_item,
                                    provider: payout.provider
                                };
                            }),
                            provider: payout.provider
                        };
                    });
                    inBatchpayouts = inBatchpayouts.concat(cardstreamChPayouts);
                }
            });
            const adyenPayouts = getBatchOfNonDatmanPayouts(payoutResult);
            inBatchpayouts = inBatchpayouts.concat(adyenPayouts);
            const stripeAccountType = stripeAccountMap[merchant.stripeAccountType];
            const stripe = require('stripe')(stripeCredentials[stripeAccountType].sk);

            if (merchant.stripeId) {
                let list = await stripe.payouts.list({ limit: 100 }, { stripeAccount: merchant.stripeId });
                let stripePayouts = formateStripePayout(
                    list.data.filter(
                        (res) =>
                            moment.unix(res.created).month() === moment(selectedDate).month() &&
                            moment.unix(res.created).year() === moment(selectedDate).year()
                    )
                );
                inBatchpayouts = inBatchpayouts.concat(stripePayouts);
            }
        }

        const transactionData = {
            in_batch: inBatchpayouts,
            not_in_batch: notInBatchPayouts,
            dnaPayouts: dnaPayoutsResult
        };
        return transactionData;
    }
}

const formateStripePayout = (payouts) => {
    return payouts.map((payout) => {
        return {
            ...payout,
            total: payout.amount,
            provider: AcquirersNameMap.STRIPE
        };
    });
};

const getFormattedNotInBatchPayoutsSets = (notInBatchPayouts = [], provider) => {
    let formattedNotInBatchPayoutsSets = [
        {
            batch_items: [],
            total: notInBatchPayouts.reduceRight((memo, payout) => memo + Number(payout.total), 0),
            provider: provider
        }
    ];

    //Keeping it as array of 1 to minimize future changes, if needed
    formattedNotInBatchPayoutsSets[0].batch_items = notInBatchPayouts.map((payout, index) => {
        return {
            date_requested: payout.time,
            rowKeyIndex: index,
            total: payout.total,
            method: payout.method,
            provider: payout.provider
        };
    });
    return formattedNotInBatchPayoutsSets;
};

const getBatchOfNonDatmanPayouts = (payouts) => {
    const transactedPayouts = payouts.reduce((payout, obj) => {
        const transactionData = { ...obj.transaction_data };
        let key = obj.provider;
        if (transactionData.status === 'SENT' && obj.provider === 'ADYEN') {
            let existing = payout[key] || {};
            const existingBatch = existing.batch_items ? existing.batch_items : [];
            const batchItems = {
                ...transactionData,
                total: transactionData?.amount,
                provider: obj.provider
            };
            delete batchItems['amount'];

            existingBatch.push(batchItems);

            existing = {
                ...existing,
                total: Number(
                    (
                        Number(transactionData?.amount.toFixed(2)) +
                        (existing.total ? Number(existing?.total.toFixed(2)) : 0)
                    ).toFixed(2)
                ),
                currency: transactionData.currency,
                expected_date: transactionData.expected_date,
                status: transactionData.status,
                provider: obj.provider,
                batch_items: [...existingBatch]
            };

            payout[key] = existing;
        }

        return payout;
    }, {});
    return Object.values(transactedPayouts);
};
