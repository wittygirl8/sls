var { response, sendEmail, getResetPasswordEmail, middy, userTypesValidatorMiddleware, models } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');

const { UserType } = models;
import { ResellerRepo } from '../../../../libs/repo';

var { connectDB } = process.env.IS_OFFLINE ? require('../../../../layers/models_lib/src') : require('models');
const generatePassword = require('password-generator');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

const resellerRepo = new ResellerRepo(db);

const AWS = require('aws-sdk');
const cognitoServiceProvider = new AWS.CognitoIdentityServiceProvider();

export const adminSendResetPasswordLink = middy(async (event) => {
    const { email, portalURL } = JSON.parse(event.body);

    const password = generatePassword(12, false);
    let url = process.env.WEB_CLIENT_URL;

    if (process.env.CUSTOM_DOMAINS) {
        for (let domain of process.env.CUSTOM_DOMAINS.split(',')) {
            if (domain.includes(portalURL)) {
                url = domain;
                break;
            }
        }
    }

    let locationStartPath = process.env.CUSTOM_DOMAINS ? url : `${url}/${encodeURIComponent(portalURL)}`;

    const reseller = await resellerRepo.findOne({
        where: {
            portalURL: portalURL
        }
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

    const subject = `${reseller.name} password reset link`;

    const resetPasswordLink = `${locationStartPath}/reset-password?email=${encodeURIComponent(
        email
    )}&reset-token=${encodeURIComponent(password)}`;

    let emailText = getResetPasswordEmail({ resetPasswordLink });

    await sendEmail({
        email: email,
        subject: subject,
        message: emailText,
        resellerBrandingObj
    });

    return response({ message: 'Sent the reset password link successfully.' }, 200);
}).use(userTypesValidatorMiddleware([UserType.ADMIN]));

// eslint-disable-next-line
async function getCognitoUserByUsername(username) {
    return new Promise(function (resolve) {
        cognitoServiceProvider.adminGetUser(
            { UserPoolId: process.env.COGNITO_USER_POOL_ID, Username: username },
            function (err, user) {
                resolve(user);
            }
        );
    });
}
