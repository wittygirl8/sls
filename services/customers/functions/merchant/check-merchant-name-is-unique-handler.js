require('dotenv').config();

var { response } = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../../layers/models_lib/src') : require('models');

export const checkMerchantNameIsUnique = async (event) => {
    const db = connectDB(
        process.env.DB_RESOURCE_ARN,
        process.env.INFRA_STAGE + '_database',
        '',
        process.env.SECRET_ARN,
        process.env.IS_OFFLINE
    );

    const clientId = event.pathParameters.clientId;
    const merchantName = event.queryStringParameters.merchantName;

    try {
        const merchant = await db.Merchant.findOne({
            where: {
                clientId: clientId,
                name: merchantName,
            },
        });

        if (merchant) {
            return response({ isMerchantNameUnique: false });
        } else {
            return response({ isMerchantNameUnique: true });
        }
    } catch (err) {
        return response({}, 500);
    }
};
