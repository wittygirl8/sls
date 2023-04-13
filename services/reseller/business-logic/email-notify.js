var { ResellerRepo, CanonicalResellerRepo } = require('../../../libs/repo');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
var { sendEmail, zohodeskUpdateCanonicalResellerEmailTemplate } = process.env.IS_OFFLINE
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
const canonicalResellerRepo = new CanonicalResellerRepo(db);

export class EmailNotifyUpdateCanonicalResellerService {
    async send(canonicalResellerId, resellerId, updateCanonicalResellerDetails) {
        const reseller = await resellerRepo.findOne({ where: { id: resellerId } });
        const canonicalReseller = await canonicalResellerRepo.findOne({ where: { id: canonicalResellerId } });

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

        const zohoDeskEmailTemplate = zohodeskUpdateCanonicalResellerEmailTemplate(
            updateCanonicalResellerDetails,
            canonicalReseller.companyName,
            resellerBrandingObj
        );

        await sendEmail({
            email: resellerBrandingObj.email,
            subject: 'Account Details Update for: ' + canonicalReseller.companyName,
            message: zohoDeskEmailTemplate,
            resellerBrandingObj
        });
    }
}
