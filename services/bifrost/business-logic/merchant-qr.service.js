var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');

var { QrPaymentUrlsRepo, QrCodesRepo } = require('../../../libs/repo');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

const qrPaymentUrlsRepo = new QrPaymentUrlsRepo(db);
const { QrPaymentType } = require('../helper/qr_payment_type');
const qrCodesRepo = new QrCodesRepo(db);
export class MerchantQrService {
    async getMerchantId(uuid, payment_type) {
        let qrInfo;
        if (payment_type === QrPaymentType.QR_PAYMENT_V2) {
            qrInfo = await qrPaymentUrlsRepo.findOne({ where: { uuid: uuid } });
        } else if (payment_type === QrPaymentType.QR_PAYMENT_V3) {
            qrInfo = await qrCodesRepo.findOne({ where: { qrUUID: uuid } });
        }
        return qrInfo;
    }
}
