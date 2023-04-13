var { InternalTransfersRepo } = require('../../../libs/repo/internal-transfers.repo');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const { InternalTransferStatus } = require('../helpers/InternalTransferStatus');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);
const internalTransfersRepo = new InternalTransfersRepo(db);

export class InternalTransferService {
    async SubmitInternalTransfer(event) {
        let transaction;
        try {
            const { sequelize } = db;
            transaction = await sequelize.transaction();
            const body = JSON.parse(event.body);
            const amount = body.amount;
            const description = body.description;
            const merchantFromId = body.merchantFromId;
            const merchantToId = body.merchantToId;
            const requestedByUserId = body.requestedByUserId;

            if ((!amount || amount <= 0) && !merchantFromId && !merchantToId && !requestedByUserId) {
                throw 'Invalid request data';
            }

            const internalTransferDto = {
                amount: amount,
                description: description,
                merchantFromId: merchantFromId,
                merchantToId: merchantToId,
                requestedBy: requestedByUserId,
                statusId: InternalTransferStatus.Pending
            };

            await internalTransfersRepo.save(internalTransferDto, transaction);
            await transaction.commit();
        } catch (error) {
            console.log(error);
            if (transaction) {
                await transaction.rollback();
            }

            throw error;
        }
    }
}
