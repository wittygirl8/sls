var { ResellerRepo, RelationshipRepo, UserRepo, MerchantRepo } = require('../../../libs/repo');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
var { sendEmail } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
const { approveBankUpdateEmailTemplate } = require('../email-templates/approve-bank-update-email-template');
const { youlendBankUpdateEmailTemplate } = require('../email-templates/youlend-bank-update-email-template');

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

export class EmailNotifyApproveBankUpdateService {
    async send(merchantId, resellerId, sortCode) {
        const reseller = await resellerRepo.findOne({ where: { id: resellerId } });
        const relationship = await relationshipRepo.findOne({ where: { merchantId: merchantId } });
        const merchant = await merchantRepo.findOne({ where: { id: merchantId } });
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
            address: reseller.address,
            helpPageURL: reseller.helpPageURL
        };

        const emailTemplate = approveBankUpdateEmailTemplate(resellerBrandingObj, merchant.name);

        await sendEmail({
            email: user.email,
            subject: 'Bank update notification',
            message: emailTemplate,
            resellerBrandingObj
        });

        let BANKCIRCLESORTCODE = JSON.parse(JSON.stringify(process.env.BANKCIRCLESORTCODE));
        if (BANKCIRCLESORTCODE.includes(parseInt(sortCode))) {
            const emailTemplate = youlendBankUpdateEmailTemplate(merchantId);
            await sendEmail({
                email: process.env.YOULEND,
                subject: 'Bank update notification',
                message: emailTemplate,
                resellerBrandingObj
            });
        }
    }
}
