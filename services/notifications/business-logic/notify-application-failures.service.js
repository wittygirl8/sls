var { ResellerRepo } = require('../../../libs/repo');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
var { sendEmail } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');

let _ = require('lodash');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

const alertsConfig = process.env.ALERTS_CONFIG ? JSON.parse(process.env.ALERTS_CONFIG) : {};
const resellerRepo = new ResellerRepo(db);

export class NotifyApplicationFailuresService {
    async notify(resellerId, type, details) {
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

        const emailSubject = `ALERT: Application Failure - ${type}`;

        let referralLinkAlertConfig = _.find(alertsConfig.alerts, { type: 'INVALID_FOODHUB_REFERRAL_LINK' });

        await sendEmail({
            email: referralLinkAlertConfig.emails,
            subject: emailSubject,
            message: `An application failure of type ${type} has occurred.<br><br>
            Details : <br> ${JSON.stringify(details)}`,
            resellerBrandingObj
        });
    }
}
