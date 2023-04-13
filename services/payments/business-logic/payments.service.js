import Axios from 'axios';
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
const { MerchantRepo } = require('../../../libs/repo');
const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);
const datmanAPIEndpoint = process.env.DATMAN_API_ENDPOINT;
const merchantRepo = new MerchantRepo(db);
const base64 = require('base-64');
const utf8 = require('utf8');

export class PaymentService {
    async getPayments(event, merchantId, body) {
        try {
            const merchant = await merchantRepo.findOne({
                where: { id: merchantId },
                attributes: ['id', 'merchantType']
            });

            if (!merchant) return response({ message: 'Merchant does not exist!' }, 401);

            if (merchant.merchantType) {
                body = {
                    ...body,
                    merchant_type: merchant.merchantType
                };
            }
            const axios = Axios.create();
            const bytes = utf8.encode(merchantId.toString());
            var encodedMerchantId = base64.encode(bytes);
            const token = event.headers['Authorization'] || event.headers['authorization'];

            var config = {
                method: 'post',
                url: `${datmanAPIEndpoint}/portal/paymentsv3`,
                headers: {
                    Authorization: token + '!!!' + encodedMerchantId,
                    'Content-Type': 'application/json'
                },
                data: body
            };

            const payments = await axios(config);
            return response({ ...payments.data }, 200);
        } catch (error) {
            console.log('error', error);
            throw new Error(error);
        }
    }
}
