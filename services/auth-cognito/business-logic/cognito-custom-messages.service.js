import { ResellerRepo } from '../../../libs/repo';

var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

const resellerRepo = new ResellerRepo(db);
export class CognitoCustomMessagesService {
    getUserFirstTimeOnboaringVerificationCodeEmailMessage({ url, userAttributes, codeParameter, resellerBrandingObj }) {
        let emailMessage = `
            <div style="color:#44435E;">
                <p >
                    Hi ${userAttributes.given_name || ''},<br><br>
                    Your ${resellerBrandingObj.resellerName} portal upgrade is almost complete. Below is your 6 digit
                    verification code.<br><br>
                    <b style="font-size:larger;">Verification Code ${codeParameter}</b> <br><br>
                    <br>
                    Please click below link where you'll need to enter the above code in order to finalise the process.
                    <br>
                    <br>
                    <a style="font-size:larger;" href="${url}/forgot-password?email=${encodeURIComponent(
            userAttributes.email
        )}&code=${codeParameter}" target="_blank">Reset password</a>
                    <br>
                    <br>
                    We hope you enjoy the new portal and working hard to make it even better.<br><br>
                    Regards,<br>
                    The ${resellerBrandingObj.resellerName} Team
                </p>
            </div>
        `;

        return emailMessage;
    }

    async sendForgotPasswordEmail(userAttributes, codeParameter, resellerPortalUrl, firstTimePasswordReset) {
        const reseller = await resellerRepo.findOne({
            where: {
                portalURL: resellerPortalUrl
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
        let portalLink = process.env.WEB_CLIENT_URL;
        if (process.env.CUSTOM_DOMAINS) {
            for (let domain of process.env.CUSTOM_DOMAINS.split(',')) {
                if (domain.includes(resellerPortalUrl)) {
                    portalLink = domain;
                    break;
                }
            }
        }
        let locationStartPath = process.env.CUSTOM_DOMAINS
            ? portalLink
            : `${portalLink}/${encodeURIComponent(resellerPortalUrl)}`;
        if (firstTimePasswordReset) {
            const emailTemplate = this.getUserFirstTimeOnboaringVerificationCodeEmailMessage({
                url: locationStartPath,
                userAttributes,
                codeParameter,
                resellerBrandingObj
            });
            const emailSubject = `${resellerBrandingObj.resellerName} Password Reset`;

            return { emailSubject, emailTemplate };
        } else {
            const emailTemplate = this.getForgotPasswordEmail({
                url: locationStartPath,
                userAttributes,
                codeParameter,
                resellerBrandingObject: resellerBrandingObj
            });
            const emailSubject = `Reset your ${resellerBrandingObj.resellerName} Password`;

            return { emailSubject, emailTemplate };
        }
    }

    getForgotPasswordEmail({ url, userAttributes, codeParameter, resellerBrandingObject }) {
        let emailMessage = `
        <html>
    <head> </head>
    <body class="clean-body" style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #ffffff;">
        <table
            cellpadding="0"
            cellspacing="0"
            class="nl-container"
            role="presentation"
            style="
                table-layout: fixed;
                vertical-align: top;
                min-width: 320px;
                margin: 0 auto;
                border-spacing: 0;
                border-collapse: collapse;
                background-color: #ffffff;
                width: 100%;
            "
            valign="top"
            width="100%"
        >
            <tbody>
                <tr style="vertical-align: top;" valign="top">
                    <td style="word-break: break-word; vertical-align: top;" valign="top">
                        <div style="background-color: transparent;">
                            <div
                                class="block-grid"
                                style="
                                    margin: 0 auto;
                                    min-width: 320px;
                                    max-width: 600px;
                                    overflow-wrap: break-word;
                                    word-wrap: break-word;
                                    word-break: break-word;
                                    background-color: #f6f7fa;
                                "
                            >
                                <div
                                    style="
                                        border-collapse: collapse;
                                        display: table;
                                        width: 100%;
                                        background-color: #f6f7fa;
                                    "
                                >
                                    <div
                                        class="col num12"
                                        style="
                                            min-width: 320px;
                                            max-width: 600px;
                                            display: table-cell;
                                            vertical-align: top;
                                            width: 600px;
                                        "
                                    >
                                        <div style="width: 100% !important;">
                                            <div
                                                style="
                                                    border: 0px solid transparent;
                                                    padding-top: 5px;
                                                    padding-bottom: 5px;
                                                    padding-right: 0px;
                                                    padding-left: 0px;
                                                "
                                            >
                                                <div
                                                    align="left"
                                                    class="button-container"
                                                    style="
                                                        padding-top: 0px;
                                                        padding-right: 0px;
                                                        padding-bottom: 10px;
                                                        padding-left: 0px;
                                                    "
                                                >
                                                    <div
                                                        style="
                                                            text-decoration: none;
                                                            display: inline-block;
                                                            color: #ffffff;
                                                            border-radius: 4px;
                                                            -webkit-border-radius: 4px;
                                                            -moz-border-radius: 4px;
                                                            width: auto;
                                                            width: auto;
                                                            padding-top: 5px;
                                                            padding-bottom: 5px;
                                                            font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
                                                            text-align: center;

                                                            word-break: keep-all;
                                                        "
                                                    >
                                                    <a style="text-decoration:none;" href="${
                                                        resellerBrandingObject.website || 'https://mypay.co.uk'
                                                    }" target="_blank">
                                                    <div style="
                                                    width: 180px;
                                                    font-size: 24px;">
                                                                  <div style="height: 100%;
                                                    font-weight: bold;
                                                    color: #ffffff;
                                                    cursor: pointer;"><img style="width: 100%;" src="${
                                                        resellerBrandingObject.resellerLogo
                                                    }" /></div>
                                                                  </div>
                                                    </a>
                                                        
                                                    </div>
                                                </div>

                                                <div
                                                    style="
                                                        color: #555555;
                                                        font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
                                                        line-height: 1.2;
                                                        padding-top: 10px;
                                                        padding-right: 50px;
                                                        padding-bottom: 10px;
                                                        padding-left: 50px;
                                                    "
                                                >
                                                    <div><p
                                                                style="
                                                                font-size: 14px;
                                                                line-height: 1.2;
                                                                word-break: break-word;
                                                                margin: 0;">
                                                                Hi ${userAttributes.given_name}
                                                            </p>
                                                            <p style="
                                                                font-size: 14px;
                                                                line-height: 1.2;
                                                                word-break: break-word;
                                                                margin: 0;">
                                                                    We have received a request to reset your password.Please click on the Reset Password  link below, and when prompted enter the 6 digit verification code displayed below. You will then be able to reset your password and continue using the ${
                                                                        resellerBrandingObject.resellerName
                                                                    } portal.
                                                            </p>
                                                        <h3 style="font-size: 16px; ">
                                                          Verification Code ${codeParameter}
                                                        </h3>
                                                    </div>
                                                </div>

                                                <div align="center" class="button-container" style="padding: 1px;">
                                                    <div
                                                        style="
                                                            text-decoration: none;
                                                            display: inline-block;
                                                            color: #ffffff;
                                                            background-color: #43425d;
                                                            border-radius: 14px;
                                                            -webkit-border-radius: 14px;
                                                            -moz-border-radius: 14px;
                                                            width: auto;
                                                            width: auto;
                                                            border: 1px solid #43425d;
                                                            padding-top: 1px;
                                                            padding-bottom: 5px;
                                                            font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
                                                            text-align: center;
                                                            word-break: keep-all;
                                                        "
                                                    >
                                                    <a id='forgot-password-link' 
                                                        href="${url}/forgot-password?email=${encodeURIComponent(
            userAttributes.email
        )}&code=${codeParameter}" target="_blank">
                                                        <span
                                                            style="
                                                                padding-left: 60px;
                                                                padding-right: 60px;
                                                                font-size: 16px;
                                                                display: inline-block;
                                                                cursor: pointer;
                                                            "
                                                            ><span
                                                                style="
                                                                    font-size: 16px;
                                                                    line-height: 2;
                                                                    word-break: break-word;
                                                                    color: #fff;
                                                                    cursor: pointer;
                                                                "
                                                                >Reset your ${
                                                                    resellerBrandingObject.resellerName
                                                                } password</span
                                                            ></span>
                                                        </a>
                                                    </div>
                                                </div>
                                                <div
                                                    style="
                                                        color: #555555;
                                                        font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
                                                        line-height: 1.2;
                                                        padding-top: 10px;
                                                        padding-right: 50px;
                                                        padding-bottom: 10px;
                                                        padding-left: 50px;
                                                    "
                                                >
                                                    <div>
                                                        <p style="
                                                            font-size: 14px;
                                                            line-height: 1.2;
                                                            word-break: break-word;
                                                            margin: 0;">

                                                            If you did not request a new password, please contact our <a id='customer-support-link' href="${
                                                                resellerBrandingObject.resellerContactUsPage
                                                            }" target="_blank">customer support</a>
                                                        </p>
                                                        Regards,
                                                        The ${resellerBrandingObject.resellerName} team.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </body>
    </html>

        
        `;

        return emailMessage;
    }
}
