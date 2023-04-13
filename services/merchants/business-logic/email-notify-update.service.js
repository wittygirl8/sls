var { ResellerRepo, RelationshipRepo, UserRepo, MerchantRepo } = require('../../../libs/repo');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
var { sendEmail, updateAccDetailEmailTemplate, zenDeskUpdateAccountDetailEmailTemplate, constants } = process.env
    .IS_OFFLINE
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
    async send(merchantId, resellerId, updatedAccountDetails) {
        const reseller = await resellerRepo.findOne({ where: { id: resellerId } });
        const relationship = await relationshipRepo.findOne({ where: { merchantId: merchantId } });
        const user = await userRepo.findByPk(relationship.userId);
        const merchant = await merchantRepo.findOne({ where: { id: merchantId } });
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

        const emailTemplate = updateAccDetailEmailTemplate(reseller.name, resellerBrandingObj.email);
        const mypayZendeskEmailTemplate = zenDeskUpdateAccountDetailEmailTemplate(
            updatedAccountDetails,
            merchant.legalName,
            resellerBrandingObj
        );
        await sendEmail({
            email: user.email,
            subject: 'Notification for Account Update',
            message: emailTemplate,
            resellerBrandingObj
        });
        if (constants.ResellerType.OMNIPAY == resellerBrandingObj.resellerName) {
            await sendEmail({
                email: constants.OMNIPAY_ADMIN_TEAM_EMAIL,
                subject: 'Account Details Update for: ' + merchant.name,
                message: mypayZendeskEmailTemplate,
                resellerBrandingObj
            });
        }
    }
}
