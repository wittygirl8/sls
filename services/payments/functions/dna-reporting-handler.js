var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
var { dnaReportingPublisher } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');

const { AcquirerAccountConfigurationRepo } = require('../../../libs/repo');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

const acquirerAccountConfigurationRepo = new AcquirerAccountConfigurationRepo(db);
const { Op } = db.Sequelize;

export const dnaReportingData = async () => {
    try {
        const allMerchants = await acquirerAccountConfigurationRepo.findAll({
            where: {
                acquirer: 'DNA',
                accountStatus: 'ACTIVE',
                [Op.or]: [
                    { lastDnaEcomReportUpdatedDate: { [Op.not]: null } },
                    { lastDnaPosReportUpdatedDate: { [Op.not]: null } }
                ]
            },
            attributes: ['merchant_id']
        });

        if (allMerchants.length > 0) {
            for (let i = 0; i < allMerchants.length; i++) {
                // await main(allMerchants[i].merchant_id);
                await dnaReporting(allMerchants[i].merchant_id);
            }
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
};

const dnaReporting = async (merchantId) => {
    const dnaReportingDto = {
        data: {
            merchantId: merchantId
        },
        queueUrl: process.env.DNA_REPORTING_QUEUE_FIFO_URL
    };
    await dnaReportingPublisher(dnaReportingDto);
};
