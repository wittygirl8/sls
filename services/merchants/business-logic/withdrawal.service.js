var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
var {
    WithdrawalsRepo,
    RelationshipRepo,
    UserRoleRepo,
    UserRepo,
    ResellerRepo,
    MerchantRepo
} = require('../../../libs/repo');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
var { getWithdrawalNotificationMessage, models, sendEmail } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
const { WithdrawalStatus } = require('../helpers/WithdrawalStatus');
const { getCountryCurrencySymbol } = require('../helpers/getCountryCurrencySymbol');
const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

const merchantRepo = new MerchantRepo(db);
const withdrawalsRepo = new WithdrawalsRepo(db);
const relationshipRepo = new RelationshipRepo(db);
const userRoleRepo = new UserRoleRepo(db);
const userRepo = new UserRepo(db);
const resellerRepo = new ResellerRepo(db);

export class WithdrawalService {
    async CheckFirstWithdrawal(event) {
        try {
            const merchantId = event.pathParameters.merchantId;
            const withdrawal = await withdrawalsRepo.findOne({
                where: {
                    merchantId: merchantId
                }
            });

            const isFirstWithdrawal = withdrawal ? false : true;

            return response({ isFirstWithdrawal }, 200);
        } catch (error) {
            return response({ error: error }, 500);
        }
    }

    async SubmitWithdrawal(event) {
        let transaction;
        try {
            const { sequelize } = db;
            transaction = await sequelize.transaction();
            const body = JSON.parse(event.body);
            const amount = body.amount;
            const merchantId = event.pathParameters.merchantId;
            const requestedByUserId = body.requestedByUserId;
            const merchant = await merchantRepo.findOne({ where: { id: merchantId } });

            if (!amount || amount <= 0 || !merchantId || !requestedByUserId) {
                console.error(
                    `amount: ${amount}`,
                    `merchantId: ${merchantId}`,
                    `requestedByUserId: ${requestedByUserId}`
                );
                throw 'Invalid request data';
            }

            const ownerRole = await userRoleRepo.findOne({
                where: {
                    name: models.UserRole.OWNER
                }
            });

            const ownerRelationship = await relationshipRepo.findOne({
                where: {
                    merchantId: merchantId,
                    roleId: ownerRole.id
                }
            });

            const owner = await userRepo.findOne({
                where: {
                    id: ownerRelationship.userId
                }
            });

            const withdrawalDto = {
                amount: amount,
                merchantId: merchantId,
                requestedBy: requestedByUserId,
                statusId: WithdrawalStatus.Pending
            };

            const inviterRelationship = await relationshipRepo.findOne({
                where: {
                    //one merchant will not belong to more than one reseller, so no need of userId
                    //userId: requestedByUserId,
                    merchantId: merchantId
                }
            });

            const inviterReseller = await resellerRepo.findOne({
                where: {
                    id: inviterRelationship.resellerId
                }
            });

            const resellerBrandingObj = {
                resellerLogo: inviterReseller.logo,
                resellerContactUsPage: inviterReseller.contactUsPageURL,
                portalURL: inviterReseller.portalURL,
                resellerName: inviterReseller.name,
                email: inviterReseller.suportEmail,
                termAndCondPageUrl: inviterReseller.termAndCondPageUrl,
                supportTelNo: inviterReseller.supportTelNo,
                brandingURL: inviterReseller.brandingURL,
                senderEmail: inviterReseller.senderEmail,
                website: inviterReseller.website,
                address: inviterReseller.address
            };

            let emailText = getWithdrawalNotificationMessage();
            const currencySymbol = getCountryCurrencySymbol(merchant.country);
            emailText = emailText.replace(new RegExp('##owner_name##', 'g'), `${owner.firstName} ${owner.lastName}`);
            emailText = emailText.replace(
                new RegExp('##amount##', 'g'),
                `${currencySymbol}${parseFloat(amount).toFixed(2)}`
            );
            emailText = emailText.replace(new RegExp('##company_website##', 'g'), resellerBrandingObj.website);
            emailText = emailText.replace(new RegExp('##company_name##', 'g'), resellerBrandingObj.resellerName);

            const subject = 'Withdrawal money request';
            await sendEmail({ email: owner.email, subject: subject, message: emailText, resellerBrandingObj });

            await withdrawalsRepo.save(withdrawalDto, transaction);
            await transaction.commit();
        } catch (error) {
            console.error(error);
            if (transaction) {
                await transaction.rollback();
            }

            throw error;
        }
    }
}
