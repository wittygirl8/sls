import axios from 'axios';
import { ResellerRepo } from '../../../libs/repo';
import { getPayByLinkEmailContent } from './email-templates/get-pay-by-link-email-content';

const {
    IS_OFFLINE,
    DATMAN_SES_HANDLER_API_KEY,
    GATEWAY_MESSAGING_ENDPOINT,
    DB_RESOURCE_ARN,
    INFRA_STAGE,
    SECRET_ARN,
    MYPAY_GATEWAY_LINK,
    DATMAN_API_ENDPOINT
} = process.env;

let { response, sendEmail } = require('mypay-helpers');
let { connectDB } = require('models');

if (IS_OFFLINE) {
    const { response: response_offline, sendEmail: sendEmail_offline } = require('../../../layers/helper_lib/src');
    const { connectDB: connectDB_offline } = require('../../../layers/models_lib/src');

    response = response_offline;
    sendEmail = sendEmail_offline;
    connectDB = connectDB_offline;
}

const API_ENDPOINT_SEND_PAYMENT_VIA_SMS = GATEWAY_MESSAGING_ENDPOINT + '/sns/send-sms';

const db = connectDB(DB_RESOURCE_ARN, INFRA_STAGE + '_database', '', SECRET_ARN, IS_OFFLINE);

const resellerRepo = new ResellerRepo(db);

export const sendPayByLinkEmail = async (event) => {
    try {
        const {
            sessionId,
            payvia,
            portalURL,
            phoneNumber,
            email,
            amount,
            currencySymbol,
            description,
            merchantName,
            requestSendAt
        } = JSON.parse(event.body);

        let linkForTheUserToPay = `${MYPAY_GATEWAY_LINK}/pay/${sessionId}`;

        if (payvia === 'QR') {
            //send paymentLink for QR and return
            return response(
                {
                    success: true,
                    paymentLink: linkForTheUserToPay,
                    message: 'Success'
                },
                200
            );
        }

        if (payvia === 'SMS' || payvia === 'DNA_SMS') {
            if (payvia === 'DNA_SMS') {
                //SampleURL
                //https://th1cyoang7.execute-api.eu-central-1.amazonaws.com/prod/portal/dna-redirect/d2343e2c-ebb6-4749-86b6-b30e5d1d5af1
                linkForTheUserToPay = `${DATMAN_API_ENDPOINT}/portal/dna-redirect/${sessionId}`;
            }

            //ERROR check
            if (!phoneNumber) {
                return response(
                    {
                        success: false,
                        paymentLink: '',
                        message: 'Missing required field phone number.'
                    },
                    400
                );
            }

            // send sms and return
            const smsText = `Please complete your payment by clicking on ${linkForTheUserToPay}`;

            const headersToSendToGatewayMessagingService = {
                api_key: DATMAN_SES_HANDLER_API_KEY
            };

            const payloadToSendToGatewayMessagingService = {
                message_text: smsText,
                phone_number: phoneNumber,
                SenderId: portalURL?.includes('datmancrm') ? 'Datman' : 'OmniPay'
            };

            await axios.post(API_ENDPOINT_SEND_PAYMENT_VIA_SMS, payloadToSendToGatewayMessagingService, {
                headers: headersToSendToGatewayMessagingService
            });

            return response(
                {
                    success: true,
                    paymentLink: '',
                    message: 'SMS sent successfully'
                },
                200
            );
        }

        if (payvia === 'DNA_EMAIL') {
            linkForTheUserToPay = `${DATMAN_API_ENDPOINT}/portal/dna-redirect/${sessionId}`;
        }

        // let url = process.env.WEB_CLIENT_URL;

        // if (process.env.CUSTOM_DOMAINS) {
        //     for (let domain of process.env.CUSTOM_DOMAINS.split(',')) {
        //         if (domain.includes(portalURL)) {
        //             url = domain;
        //             break;
        //         }
        //     }
        // }

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

        const subject = `Complete your payment`;

        const emailText = getPayByLinkEmailContent({
            linkForTheUserToPay,
            merchantName,
            amount,
            currencySymbol,
            description,
            requestSendAt
        });

        await sendEmail({
            email: email,
            subject: subject,
            message: emailText,
            resellerBrandingObj
        });

        return response({ message: 'Email has been sent successfully.', success: true, paymentLink: '' }, 200);
    } catch (e) {
        console.log(e?.response, 'error', e);
        return response({ message: 'Something went wrong', success: false, paymentLink: '' }, 400);
    }
};
