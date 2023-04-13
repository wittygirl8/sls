const axios = require('axios');

var { response, getUserId } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');

import { ResellerRepo, UserRepo } from '../../../libs/repo';
import { getEmailOrderReceiptTemplate } from '../templates/email-order-receipt-template';
import { getSMSOrderReceiptTemplate } from '../templates/sms-order-receipt-template';

let DATMAN_SES_HANDLER_API_KEY = process.env.DATMAN_SES_HANDLER_API_KEY;
let GATEWAY_MESSAGING_ENDPOINT = process.env.GATEWAY_MESSAGING_ENDPOINT;
let SEND_ORDER_RECEIPT_ENDPOINT = GATEWAY_MESSAGING_ENDPOINT + '/order-receipt';

/*
These are the endpoints, which are to be used.

GATEWAY_MESSAGING_ENDPOINT/ses/send-mail;
GATEWAY_MESSAGING_ENDPOINT/sns/send-sms;
GATEWAY_MESSAGING_ENDPOINT/ses/create-template;
GATEWAY_MESSAGING_ENDPOINT/ses/list-template;

Please go through https://datman.atlassian.net/wiki/spaces/ND/pages/1239482375/Email+Message+Api+Doc to see the usage
*/

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

const resellerRepo = new ResellerRepo(db);
const userRepo = new UserRepo(db);

export const sendOrderReceipt = async (event) => {
    const { communicationChannel: communicationChannel, portal_url: portalURL, orderId: orderId } = JSON.parse(
        event.body
    );

    const userId = await getUserId(event);
    const user = await userRepo.findByPk(userId);

    if (!user) {
        return response({ message: 'User does not exist' }, 404);
    }

    if (!portalURL) {
        return response({ message: 'Missing fields portal_url.' }, 400);
    }

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
    let smsText = '';
    let emailText = '';
    let payloadToSendToGatewayMessagingService;
    if (communicationChannel === 'SMS') {
        smsText = getSMSOrderReceiptTemplate({ resellerBrandingObj });
        payloadToSendToGatewayMessagingService = {
            communication_channel: communicationChannel,
            mobile_number: user.phoneNumber,
            orderId: orderId,
            smsText: smsText
        };
    } else {
        emailText = getEmailOrderReceiptTemplate({ resellerBrandingObj });
        payloadToSendToGatewayMessagingService = {
            communication_channel: communicationChannel,
            from_address: reseller.suportEmail,
            to_address: user.email,
            orderId: orderId,
            emailText: emailText
        };
    }

    let headersToSendToGatewayMessagingService = {
        api_key: DATMAN_SES_HANDLER_API_KEY
    };

    try {
        await axios.post(SEND_ORDER_RECEIPT_ENDPOINT, payloadToSendToGatewayMessagingService, {
            headers: headersToSendToGatewayMessagingService
        });
    } catch (ex) {
        console.log('Error in sendOrderReceiptByEmail: ', ex.message);
        return response({ message: 'Something went wrong while sending the email.' }, 500);
    }

    return response({ message: 'Sent the order receipt by email successfully.' }, 200);
};
