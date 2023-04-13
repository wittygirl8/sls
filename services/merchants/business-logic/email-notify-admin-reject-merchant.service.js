var { ResellerRepo, MerchantRepo, UserRepo, RelationshipRepo } = require('../../../libs/repo');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
var { sendEmail, adminRejectMerchantEmailTemplate, pepRejectionMailTemplate } = process.env.IS_OFFLINE
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
const merchantRepo = new MerchantRepo(db);
const userRepo = new UserRepo(db);
const relationshipRepo = new RelationshipRepo(db);
export class EmailNotifyAdminRejectMerchant {
    async send(resellerId, merchantId, isPep, notes) {
        const reseller = await resellerRepo.findOne({ where: { id: resellerId } });
        const merchant = await merchantRepo.findOne({ where: { id: merchantId } });
        const relationship = await relationshipRepo.findOne({
            where: { merchantId: merchantId, resellerId: resellerId }
        });
        const user = await userRepo.findOne({ where: { id: relationship.userId } });
        const userId = user.id;
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

        if (isPep) {
            emailTemplate = pepRejectionMailTemplate({
                resellerBrandingObj,
                merchant
            });

            await userRepo.updateById(userId, {
                isPep: true
            });
        } else {
            emailTemplate = adminRejectMerchantEmailTemplate({
                resellerBrandingObj,
                merchant,
                notes
            });

            let portalLink = process.env.WEB_CLIENT_URL;
            if (process.env.CUSTOM_DOMAINS) {
                for (let domain of process.env.CUSTOM_DOMAINS.split(',')) {
                    if (domain.includes(reseller.portalURL)) {
                        portalLink = domain;
                        break;
                    }
                }
            }
            let locationStartPath = process.env.CUSTOM_DOMAINS
                ? portalLink
                : `${portalLink}/${encodeURIComponent(reseller.portalURL)}`;

            const requestForSupportLink = `${locationStartPath}/request-support-form?merchantId=${encodeURIComponent(
                merchant.id
            )}`;
            emailTemplate = emailTemplate.replace(new RegExp('##request_for_support##', 'g'), requestForSupportLink);
        }

        await sendEmail({
            email: user.email,
            subject: resellerBrandingObj.resellerName + ' Merchant Application rejected.',
            message: emailTemplate,
            resellerBrandingObj
        });
    }
}
