var { ResellerRepo, UserRepo, MerchantRepo } = require('../../../libs/repo');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
var { sendEmail, zendeskAdminCloseAccountEmailTemplate, constants } = process.env.IS_OFFLINE
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
const userRepo = new UserRepo(db);
const merchantRepo = new MerchantRepo(db);

export class EmailNotifyAdminCloseAccountService {
    async send(merchantId, resellerId, userId) {
        const reseller = await resellerRepo.findOne({ where: { id: resellerId } });
        if (reseller.name === constants.ResellerType.OMNIPAY) {
            const user = await userRepo.findByPk(userId);
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

            const closeAccountEmailTemplate = zendeskAdminCloseAccountEmailTemplate(resellerBrandingObj);

            await sendEmail({
                email: user.email,
                subject: 'Request to close account: ' + merchant.name,
                message: closeAccountEmailTemplate,
                resellerBrandingObj
            });
        }
    }
}
