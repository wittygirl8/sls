'use strict';
import Axios from 'axios';
const { response, middy, userAccessValidatorMiddleware } = process.env.IS_OFFLINE
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

const { MerchantRepo, AcquirerAccountConfigurationRepo } = require('../../../libs/repo');

const merchantRepo = new MerchantRepo(db);
const acquirerAccountConfigurationRepo = new AcquirerAccountConfigurationRepo(db);

const ADYEN_API_KEY = process.env.ADYEN_API_KEY;
const ADYEN_API_URL = process.env.ADYEN_API_URL;

export const getAdyenHopUrl = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;

        const merchant = await merchantRepo.findOne({ where: { id: merchantId } });
        if (!merchant) {
            return response('Merchant does not exist', 404);
        }

        const adyenMerchant = await acquirerAccountConfigurationRepo.findOne({
            where: { merchantId: merchantId }
        });

        if (
            !adyenMerchant ||
            adyenMerchant?.accountStatus === 'SUSPENDED' ||
            adyenMerchant?.accountStatus === 'CLOSED'
        ) {
            return response('unauthorized', 401);
        }

        const axios = Axios.create();
        var config = {
            method: 'post',
            url: `${ADYEN_API_URL}/Hop/v6/getOnboardingUrl`,
            data: {
                accountHolderCode: merchantId,
                returnUrl: `https://portal.datmancrm.com/home?submerchant=${merchantId}`
            },
            headers: {
                'x-API-key': ADYEN_API_KEY,
                'Content-Type': 'application/json',
                'cache-control': 'no-cache'
            }
        };
        const adyenResponse = await axios(config);
        const { redirectUrl } = adyenResponse?.data;
        return response(redirectUrl);
    } catch (error) {
        console.error('error in onboarding redirection', error);
        return response(error, 500);
    }
}).use(userAccessValidatorMiddleware());
