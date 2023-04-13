var { ResellerRepo } = require('../../../libs/repo');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
var { sendEmail, newMerchantActivationEmailTemplate, constants } = process.env.IS_OFFLINE
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

export class EmailNotifyNewMerchantService {
    async send(merchantId, thirdPartyCustomerId, resellerId) {
        const reseller = await resellerRepo.findOne({ where: { id: resellerId } });

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

        const emailTemplate = newMerchantActivationEmailTemplate({
            merchantId,
            thirdPartyCustomerId,
            resellerName: resellerBrandingObj.resellerName
        });

        await sendEmail({
            email: constants.ADMIN_TEAM_EMAIL,
            subject: 'New Merchant Activation',
            message: emailTemplate,
            resellerBrandingObj
        });
    }
}
