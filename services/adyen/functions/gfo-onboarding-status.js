'use strict';
const { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);
const moment = require('moment');
const { MerchantRepo, AcquirerAccountConfigurationRepo } = require('../../../libs/repo');

const merchantRepo = new MerchantRepo(db);
const acquirerAccountConfigurationRepo = new AcquirerAccountConfigurationRepo(db);
const { AdyenService } = require('../business-logic/adyen.service');
const adyenService = new AdyenService();
const T2S_API_KEY = process.env.T2S_API_KEY;

export const gfoOnboardingStatus = async (event) => {
    try {
        const { api_key } = event.headers;

        if (!api_key || api_key !== T2S_API_KEY) {
            return response(
                {
                    message: 'UNAUTHORISED'
                },
                401
            );
        }

        let merchantId;
        let body;
        let responseCode;

        if (event.httpMethod === 'GET') {
            merchantId = event.pathParameters.merchantId;
        } else {
            body = JSON.parse(event.body);
            merchantId = body.merchantId;
        }
        let res = {};

        const merchant = await merchantRepo.findOne({
            where: { id: merchantId }
        });

        if (!merchant) {
            responseCode = 400;
            res = {
                success: false,
                message: 'Merchant does not exist!'
            };
            return response({ ...res }, responseCode);
        }

        const acquirerAccountConfiguration = await acquirerAccountConfigurationRepo.findOne({
            where: { merchantId: merchantId }
        });

        if (!acquirerAccountConfiguration && event.httpMethod === 'POST') {
            responseCode = 201;
            const resellerId = 2;
            const adyenLevel = 1;
            await adyenService.adyenOnboarding(merchantId, resellerId, adyenLevel, true);
            const updatedAcqConfig = await acquirerAccountConfigurationRepo.findOne({
                where: { merchantId: merchantId }
            });
            const otherStatus = updatedAcqConfig && updatedAcqConfig.reason ? JSON.parse(updatedAcqConfig?.reason) : {};
            res = {
                ...otherStatus,
                success: true,
                accountStatus: updatedAcqConfig.accountStatus,
                payoutStatus: updatedAcqConfig.payoutStatus,
                dateOfCreation: moment(updatedAcqConfig.createdAt).format('YYYY-DD-MM hh:mm')
            };
        } else {
            if (!acquirerAccountConfiguration) {
                responseCode = 400;
                res = {
                    success: false,
                    message: 'Merchant does not exist on adyen!'
                };
                return response({ ...res }, responseCode);
            }

            if (event.httpMethod === 'GET') {
                responseCode = 200;
            } else {
                responseCode = 201;
            }
            const otherStatus =
                acquirerAccountConfiguration && acquirerAccountConfiguration.reason
                    ? JSON.parse(acquirerAccountConfiguration?.reason)
                    : {};

            res = {
                ...otherStatus,
                success: true,
                message: 'Merchant already exists',
                accountStatus: acquirerAccountConfiguration.accountStatus,
                payoutStatus: acquirerAccountConfiguration.payoutStatus,
                dateOfCreation: moment(acquirerAccountConfiguration.createdAt).format('YYYY-DD-MM hh:mm')
            };
        }

        return response({ ...res }, responseCode);
    } catch (error) {
        console.error('Adyen get status error', error);
        return response('Internal server error', 500);
    }
};
