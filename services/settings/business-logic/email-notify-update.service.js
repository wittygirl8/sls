var { ResellerRepo, RelationshipRepo, UserRepo, MerchantRepo } = require('../../../libs/repo');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
var { sendEmail, updateBankAccDetailEmailTemplate } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

const resellerRepo = new ResellerRepo(db);
const relationshipRepo = new RelationshipRepo(db);
const userRepo = new UserRepo(db);
const merchantRepo = new MerchantRepo(db);
export class EmailNotifyUpdateService {
    async send(merchantId, resellerId) {
        const reseller = await resellerRepo.findOne({ where: { id: resellerId } });
        const relationship = await relationshipRepo.findOne({ where: { merchantId: merchantId } });
        const merchant = await merchantRepo.findOne({
            where: { id: merchantId },
            attributes: ['autoWithdraw']
        });
        const user = await userRepo.findByPk(relationship.userId);

        const resellerBrandingObj = {
            resellerLogo: reseller.logo,
            resellerContactUsPage: reseller.contactUsPageURL,
            portalURL: reseller.portalURL,
            resellerName: reseller.name,
            email: reseller.suportEmail,
            termAndCondPageUrl: reseller.termAndCondPageUrl,
            supportTelNo: reseller.supportTelNo,
            brandingURL: reseller.brandingURL,
            senderEmail: reseller.senderEmail,
            website: reseller.website,
            address: reseller.address
        };

        const emailTemplate = updateBankAccDetailEmailTemplate(reseller.name, merchant.autoWithdraw);

        await sendEmail({
            email: user.email,
            subject: 'Notification for Bank Account Update',
            message: emailTemplate,
            resellerBrandingObj
        });
    }
}
