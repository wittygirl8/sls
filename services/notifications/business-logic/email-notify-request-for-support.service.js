var { ResellerRepo, MerchantRepo } = require('../../../libs/repo');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
var { sendEmail, constants, requestForSupportEmailTemplate } = process.env.IS_OFFLINE
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

export class EmailNotifyRequestForSupportService {
    async send(data, merchantId, resellerId) {
        const reseller = await resellerRepo.findOne({ where: { id: resellerId } });
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

        const emailTemplateParams = { ...data, merchantName: merchant.name, resellerBrandingObj: resellerBrandingObj };
        const requestForSupportTemplate = requestForSupportEmailTemplate(emailTemplateParams);

        const emailSubject = 'Request for support by ' + merchant.name;

        await sendEmail({
            email: constants.OMNIPAY_ADMIN_TEAM_EMAIL,
            subject: emailSubject,
            message: requestForSupportTemplate,
            resellerBrandingObj
        });
    }
}
