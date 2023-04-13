var { ResellerRepo, UserRepo, MerchantRepo, RelationshipRepo } = require('../../../libs/repo');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
var { sendEmail } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

const resellerRepo = new ResellerRepo(db);
const userRepo = new UserRepo(db);
const merchantRepo = new MerchantRepo(db);
const relationshipRepo = new RelationshipRepo(db);

const {
    adminEnableAutoWithdrawalsEmailTemplate
} = require('../email-templates/admin-enable-auto-withdrawals-email-template');

const {
    adminDisableAutoWithdrawalsEmailTemplate
} = require('../email-templates/admin-disable-auto-withdrawals-email-template');

const {
    enableAutoWithdrawalByAccountVerificationEmailTemplate
} = require('../email-templates/enable-auto-withdrawal-by-account-verification-email-template');

export class EmailNotifyUpdateAutoWithdrawalsService {
    async send(resellerId, merchantId, throughAccountVerification) {
        const reseller = await resellerRepo.findOne({ where: { id: resellerId } });
        const relationship = await relationshipRepo.findOne({ where: { merchantId: merchantId } });
        const user = await userRepo.findByPk(relationship.userId);
        const merchant = await merchantRepo.findOne({
            where: { id: merchantId },
            attributes: ['name', 'autoWithdraw', 'country']
        });

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

        let emailTemplate;
        let emailSubject;
        if (throughAccountVerification) {
            emailSubject = 'Auto withdrawals enabled';
            emailTemplate = enableAutoWithdrawalByAccountVerificationEmailTemplate(
                resellerBrandingObj,
                merchant.name,
                merchant.country
            );
        } else if (merchant.autoWithdraw) {
            emailSubject = 'Auto withdrawals enabled';
            emailTemplate = adminEnableAutoWithdrawalsEmailTemplate(resellerBrandingObj, merchant.name);
        } else {
            emailSubject = 'Auto withdrawals disabled';
            emailTemplate = adminDisableAutoWithdrawalsEmailTemplate(resellerBrandingObj, merchant.name);
        }

        await sendEmail({
            email: user.email,
            subject: emailSubject,
            message: emailTemplate,
            resellerBrandingObj
        });
    }
}
