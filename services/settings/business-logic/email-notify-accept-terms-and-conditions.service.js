var { ResellerRepo, CanonicalResellerRepo, UserRepo, TermsAndConditionsRepo } = require('../../../libs/repo');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
var { sendEmail } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');

const {
    acceptTermsAndConditionsCanonicalResellerNotification
} = require('../email-templates/accept-terms-and-condition-canonical-reseller-notify');
const {
    adminNotificationForAcceptTermsAndConditions
} = require('../email-templates/admin-notified-for-accept-term-and-conditions');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

const { Op } = db.Sequelize;

const resellerRepo = new ResellerRepo(db);
const userRepo = new UserRepo(db);
const canonicalResellerRepo = new CanonicalResellerRepo(db);
const termsAndConditionsRepo = new TermsAndConditionsRepo(db);

export class EmailNotifyAcceptTermsAndConditoinsService {
    async send(userId, canonicalResellerId, tcDocIds) {
        const canonicalReseller = await canonicalResellerRepo.findOne({ where: { id: canonicalResellerId } });
        const reseller = await resellerRepo.findOne({ where: { id: canonicalReseller.resellerId } });
        const allTermsAncConditions = await termsAndConditionsRepo.findAll({
            where: {
                id: {
                    [Op.in]: tcDocIds
                }
            },
            attributes: ['id', 'link']
        });

        const attachments = allTermsAncConditions.map((tAndC) => {
            return { filename: `terms_and_condition.pdf`, path: tAndC.link };
        });

        const user = await userRepo.findByPk(userId);

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

        const canonicalResellerEmailTemplate = acceptTermsAndConditionsCanonicalResellerNotification(
            resellerBrandingObj,
            canonicalReseller.companyName
        );
        const adminEmailTemplate = adminNotificationForAcceptTermsAndConditions(
            resellerBrandingObj,
            canonicalReseller.companyName
        );

        await sendEmail({
            email: user.email,
            subject: `${resellerBrandingObj.resellerName} Terms & Conditions`,
            message: canonicalResellerEmailTemplate,
            attachments: attachments,
            resellerBrandingObj
        });

        await sendEmail({
            email: resellerBrandingObj.email,
            subject: 'No action required',
            message: adminEmailTemplate,
            resellerBrandingObj
        });
    }
}
