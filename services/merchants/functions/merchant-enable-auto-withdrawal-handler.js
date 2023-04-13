require('dotenv').config();

var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
var { response, MerchantStatus } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');

const { MerchantRepo } = require('../../../libs/repo');

var { MerchantService } = require('../business-logic/merchant.service');
var {
    EmailNotifyUpdateAutoWithdrawalsService
} = require('../business-logic/email-notify-update-auto-withdrawal.service');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

const merchantRepo = new MerchantRepo(db);

const merchantService = new MerchantService();
const emailNotifyUpdateAutoWithdrawalsService = new EmailNotifyUpdateAutoWithdrawalsService();

export const merchantEnableAutoWithdrawalHandler = async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;
        const body = JSON.parse(event.body);
        const { resellerId, enable } = body;

        const merchant = await merchantRepo.findOne({ where: { id: merchantId } });

        if (!merchant || merchant.status === MerchantStatus.WATCHLIST) {
            return response({}, 404);
        }

        await merchantService.merchantEnableAutoWithdrawal(merchantId, enable);
        await emailNotifyUpdateAutoWithdrawalsService.send(resellerId, merchantId, false);

        return response({});
    } catch (err) {
        console.log(err);
        return response({}, 500);
    }
};
