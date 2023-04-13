var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
const { MerchantRepo, AcquirerAccountConfigurationRepo, DnaTransactionDataRepo } = require('../../../libs/repo');
import moment from 'moment';

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);
const { Op } = db.Sequelize;
const merchantRepo = new MerchantRepo(db);
const acquirerAccountConfigurationRepo = new AcquirerAccountConfigurationRepo(db);
const dnaTransactionDataRepo = new DnaTransactionDataRepo(db);

export class DNAreportService {
    async getDnaRreport(merchantId, body) {
        const { type, fromDate, toDate } = body;
        let startDate = moment(fromDate).startOf('day').format('YYYY-MM-DDTHH:mm:ss[Z]');
        let endDate = moment(toDate).endOf('day').format('YYYY-MM-DDTHH:mm:ss[Z]');
        let numberOfDays = moment(endDate).diff(moment(startDate), 'days');
        let previousEndDate = moment(startDate).subtract(1, 'days').endOf('day').format('YYYY-MM-DDTHH:mm:ss[Z]');
        let previousStartDate = moment(previousEndDate)
            .subtract(numberOfDays ? numberOfDays + 1 : numberOfDays, 'days')
            .startOf('day')
            .format('YYYY-MM-DDTHH:mm:ss[Z]');
        let prevNumDays = moment.duration(moment(previousEndDate).diff(previousStartDate)).asDays();

        console.log('startDate: ', startDate, 'endDate: ', endDate);
        console.log('current numberOfDays: ', numberOfDays);
        console.log('previousStartDate: ', previousStartDate, 'previousEndDate: ', previousEndDate);
        console.log('prev numberOfDays: ', prevNumDays);

        try {
            const merchant = await merchantRepo.findOne({
                where: { id: merchantId },
                attributes: ['id']
            });

            if (!merchant) return response({ message: 'Merchant does not exist!' }, 401);

            const dnaMid = await acquirerAccountConfigurationRepo.findOne({
                where: {
                    merchantId: merchantId
                },
                attributes: ['dnaMid']
            });
            const dnaMerchantId = dnaMid.dataValues.dnaMid;

            let saleData = [];
            let refundData = [];
            let previousSaleData = [];
            let previousRefundData = [];
            if (type === 'all') {
                const { ecomSaleData, ecomRefundData } = await dnaEcomReport(startDate, endDate, merchantId);
                const { posSaleData, posRefundData } = await dnaPosReport(startDate, endDate, merchantId);
                const {
                    ecomSaleData: previousEcomSaleData,
                    ecomRefundData: previousEcomRefundData
                } = await dnaEcomReport(previousStartDate, previousEndDate, dnaMerchantId);
                const { posSaleData: previousPosSaleData, posRefundData: previousPosRefundData } = await dnaPosReport(
                    previousStartDate,
                    previousEndDate,
                    merchantId
                );
                saleData = [...ecomSaleData, ...posSaleData];
                refundData = [...ecomRefundData, ...posRefundData];
                previousSaleData = [...previousEcomSaleData, ...previousPosSaleData];
                previousRefundData = [...previousEcomRefundData, ...previousPosRefundData];
            } else if (type === 'payment') {
                const { ecomSaleData, ecomRefundData } = await dnaEcomReport(startDate, endDate, merchantId);
                const {
                    ecomSaleData: previousEcomSaleData,
                    ecomRefundData: previousEcomRefundData
                } = await dnaEcomReport(previousStartDate, previousEndDate, merchantId);
                saleData = [...ecomSaleData];
                refundData = [...ecomRefundData];
                previousSaleData = [...previousEcomSaleData];
                previousRefundData = [...previousEcomRefundData];
            } else {
                const { posSaleData, posRefundData } = await dnaPosReport(startDate, endDate, merchantId);
                const { posSaleData: previousPosSaleData, posRefundData: previousPosRefundData } = await dnaPosReport(
                    previousStartDate,
                    previousEndDate,
                    merchantId
                );
                saleData = [...posSaleData];
                refundData = [...posRefundData];
                previousSaleData = [...previousPosSaleData];
                previousRefundData = [...previousPosRefundData];
            }

            const saleVolume = saleData?.reduce((accumulator, object) => {
                const data = accumulator + Number(object.transactionAmount / 100);
                return data;
            }, 0);

            const refundVolume = refundData?.reduce((accumulator, object) => {
                return accumulator + Number(object.transactionAmount / 100);
            }, 0);

            const saleCardType = saleData?.reduce((accumulator, object) => {
                return { ...accumulator, [object.cardType]: (accumulator[object.cardType] || 0) + 1 };
            }, {});

            let revenuePerDay = (saleVolume - refundVolume) / (numberOfDays || 1);
            let avgSaleVolume = saleData?.length !== 0 ? saleVolume / saleData?.length : 0.0;
            let avgRefundVolume = refundData?.length !== 0 ? refundVolume / refundData?.length : 0.0;
            let orderPerDay = saleData?.length / (numberOfDays || 1);

            //data for previous date
            const previousSaleVolume = previousSaleData?.reduce((accumulator, object) => {
                return accumulator + Number(object.transactionAmount / 100);
            }, 0);

            const previousRefundVolume = previousRefundData?.reduce((accumulator, object) => {
                return accumulator + Number(object.transactionAmount / 100);
            }, 0);

            const percentageChangeInGrossVolume =
                ((Number(saleVolume) - Number(previousSaleVolume)) /
                    (Number(previousSaleVolume) ? Number(previousSaleVolume) : 0)) *
                100;

            const percentageChangeInRefundVolume =
                ((Number(refundVolume) - Number(previousRefundVolume)) /
                    (Number(previousRefundVolume) ? Number(previousRefundVolume) : 0)) *
                100;

            return response(
                {
                    saleData: saleData,
                    refundData: refundData,
                    saleVolume: saleVolume?.toFixed(2),
                    refundVolume: refundVolume?.toFixed(2),
                    previousSaleData: previousSaleData,
                    previousRefundData: previousRefundData,
                    revenuePerDay: revenuePerDay ? revenuePerDay?.toFixed(2) : 0,
                    avgSaleVolume: avgSaleVolume?.toFixed(2),
                    avgRefundVolume: avgRefundVolume?.toFixed(2),
                    orderPerDay,
                    previousSaleVolume: previousSaleVolume ? previousSaleVolume?.toFixed(2) : 0,
                    previousRefundVolume: previousRefundVolume ? previousRefundVolume?.toFixed(2) : 0,
                    percentageChangeInGrossVolume: percentageChangeInGrossVolume
                        ? percentageChangeInGrossVolume?.toFixed(2)
                        : 0,
                    percentageChangeInRefundVolume: percentageChangeInRefundVolume
                        ? percentageChangeInRefundVolume?.toFixed(2)
                        : 0,
                    cardType: { ...saleCardType }
                },
                200
            );
        } catch (error) {
            console.log('error', error);
            throw error;
        }
    }
}

const dnaEcomReport = async (fromDate, toDate, dnaMerchantId) => {
    try {
        const ecomTransactionSaleData = await dnaTransactionDataRepo.findAll({
            where: {
                type: 'sale',
                status: 'charged',
                transactionDate: { [Op.gte]: fromDate, [Op.lte]: toDate },
                merchantId: dnaMerchantId
            },
            attributes: [
                'type',
                'transactionId',
                'transactionAmount',
                ['transaction_amount', 'total'],
                'transactionDate',
                'cardScheme',
                'status'
            ]
        });
        const ecomSaleData = ecomTransactionSaleData.map((data, index) => {
            console.log(' index: ', index, 'data: ', data);
            return {
                type: data.type,
                transactionId: data.transactionId,
                transactionAmount: data.transactionAmount,
                processedDate: data.transactionDate,
                cardType: data.cardScheme
            };
        });

        const ecomTransactionRefundData = await dnaTransactionDataRepo.findAll({
            where: {
                type: 'refund',
                status: 'credited',
                transactionDate: { [Op.gte]: fromDate, [Op.lte]: toDate },
                merchantId: dnaMerchantId
            },
            attributes: [
                'type',
                'transactionId',
                'transactionAmount',
                ['transaction_amount', 'total'],
                'transactionDate',
                'cardScheme',
                'status'
            ]
        });

        const ecomRefundData = ecomTransactionRefundData.map((data, index) => {
            console.log(' index: ', index, 'data: ', data);
            return {
                type: data.type,
                transactionId: data.transactionId,
                transactionAmount: data.transactionAmount,
                processedDate: data.transactionDate,
                cardType: data.cardScheme
            };
        });

        return { ecomSaleData: ecomSaleData, ecomRefundData: ecomRefundData };
    } catch (error) {
        console.log('DNA report error=', error);
        return error;
    }
};

const dnaPosReport = async (fromDate, toDate, dnaMerchantId) => {
    try {
        const posTransactionSaleData = await dnaTransactionDataRepo.findAll({
            where: {
                type: 'retail',
                transactionDate: { [Op.gte]: fromDate, [Op.lte]: toDate },
                merchantId: dnaMerchantId
            },
            attributes: [
                'type',
                'transactionId',
                'transactionAmount',
                ['transaction_amount', 'total'],
                'transactionDate',
                'cardScheme',
                'status'
            ]
        });
        const posSaleData = posTransactionSaleData.map((data) => {
            return {
                type: data.type,
                transactionId: data.transactionId,
                transactionAmount: data.transactionAmount,
                processedDate: data.transactionDate,
                cardType: data.cardScheme
            };
        });

        const posTransactionRefundData = await dnaTransactionDataRepo.findAll({
            where: {
                type: 'credit',
                transactionDate: { [Op.gte]: fromDate, [Op.lte]: toDate },
                merchantId: dnaMerchantId
            },
            attributes: [
                'type',
                'transactionId',
                'transactionAmount',
                ['transaction_amount', 'total'],
                'transactionDate',
                'cardScheme',
                'status'
            ]
        });
        const posRefundData = posTransactionRefundData.map((data) => {
            return {
                type: data.type,
                transactionId: data.transactionId,
                transactionAmount: data.transactionAmount,
                processedDate: data.transactionDate,
                cardType: data.cardScheme
            };
        });

        return { posSaleData: posSaleData, posRefundData: posRefundData };
    } catch (error) {
        console.log('DNA report error=', error);
        return error;
    }
};
