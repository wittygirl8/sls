require('dotenv').config();
const axios = require('axios');

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

let cpToStripeReportTypeMap = {
    payouts: {
        reportType: 'connected_account_payouts.itemized.3',
        columns: ['currency', 'gross', 'fee', 'net', 'payout_status', 'payout_expected_arrival_date']
    },
    payments: {
        reportType: 'connected_account_balance_change_from_activity.itemized.3',
        columns: ['currency', 'gross', 'fee', 'net', 'created', 'available_on']
    }
};

let stripeCredentials = JSON.parse(process.env.STRIPE_CREDENTIALS);
const { stripeAccountMap } = require('../../helpers/stripeAccountMap');

const merchantRepo = new MerchantRepo(db);

export const runStripePaymentReport = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;
        let payload = JSON.parse(event.body);

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

        let startDate = payload.interval_start;
        let endDate = payload.interval_end;
        let cpReportType = payload.reportType;

        const reportObject = await stripe.reporting.reportTypes.retrieve(
            cpToStripeReportTypeMap[cpReportType].reportType
        );

        if (reportObject) {
            startDate = reportObject.data_available_start > startDate ? reportObject.data_available_start : startDate;
        }

        const eventObject = await stripe.reporting.reportRuns.create({
            report_type: cpToStripeReportTypeMap[cpReportType].reportType,
            parameters: {
                interval_start: startDate,
                interval_end: endDate,
                connected_account: merchant.stripeId,
                columns: cpToStripeReportTypeMap[cpReportType].columns
            }
        });

        return response(eventObject, 200);
    } catch (error) {
        console.log(error);
        return response({ error }, 500);
    }
}).use(userAccessValidatorMiddleware());

export const fetchStripePaymentReport = middy(async (event) => {
    try {
        const reportId = event.pathParameters.reportId;
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
        const stripeAccountType = merchant.stripeAccountType === 'EAT-APPY' ? 'eatappy' : 'datman';
        const stripe = require('stripe')(stripeCredentials[stripeAccountType].sk);

        let eventObject = await pollStripePaymentReport(checkStripePaymentReportStatus, stripe, reportId, 30000, 5000);
        if (eventObject.status === 'succeeded') {
            eventObject = await fetchStripePaymentReportData(
                eventObject.result.url,
                stripeCredentials[stripeAccountType].sk
            );
        }
        return response(eventObject, 200);
    } catch (error) {
        console.log(error);
        return response({ error }, 500);
    }
}).use(userAccessValidatorMiddleware());

async function checkStripePaymentReportStatus(stripe, reportId) {
    const eventObject = await stripe.reporting.reportRuns.retrieve(reportId);
    return eventObject;
}

async function pollStripePaymentReport(fn, stripe, reportId, timeout, ms) {
    var endTime = Number(new Date()) + (timeout || 300000);
    let result = await fn(stripe, reportId);
    while (result.status !== 'succeeded' && Number(new Date()) < endTime) {
        await wait(ms);
        result = await fn(stripe, reportId);
    }
    return result;
}

function wait(ms = 1000) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function fetchStripePaymentReportData(url, stripeSecretKey) {
    try {
        var config = {
            method: 'get',
            url: url,
            headers: {
                Authorization: `Bearer ${stripeSecretKey}`
            }
        };

        const list = await axios(config).then((result) => {
            return result;
        });

        return list.data;
    } catch (error) {
        console.log(error);
    }
}
