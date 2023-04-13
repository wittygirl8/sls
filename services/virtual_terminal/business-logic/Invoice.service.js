const {
    IS_OFFLINE,
    DATMAN_SES_HANDLER_API_KEY,
    GATEWAY_MESSAGING_ENDPOINT,
    DB_RESOURCE_ARN,
    INFRA_STAGE,
    SECRET_ARN,
    MYPAY_GATEWAY_LINK,
    DATMAN_API_ENDPOINT,
    CP_DOCS_BUCKET_NAME
} = process.env;
const { sendEmail, flakeGenerateDecimal } = IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
const { connectDB } = IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const db = connectDB(DB_RESOURCE_ARN, INFRA_STAGE + '_database', '', SECRET_ARN, IS_OFFLINE);
import Axios from 'axios';
const AWS = require('aws-sdk');
const base64 = require('base-64');
const utf8 = require('utf8');
import moment from 'moment';
const bucket = CP_DOCS_BUCKET_NAME;
const API_ENDPOINT_SEND_PAYMENT_VIA_SMS = GATEWAY_MESSAGING_ENDPOINT + '/sns/send-sms';
const EXPIRE_TIME_SECONDS = 600;
const s3Client = new AWS.S3({
    signatureVersion: 'v4'
});
const { invoicePdfTemplate } = require('../functions/pdf-template/pdf-invoice-template');
import { invoiceEmailTemplate } from '../functions/email-templates/invoice-email-template';
import { ResellerRepo } from '../../../libs/repo';
import { MerchantRepo } from '../../../libs/repo';
import { InvoicesRepo } from '../../../libs/repo';
const merchantRepo = new MerchantRepo(db);
const resellerRepo = new ResellerRepo(db);
const invoicesRepo = new InvoicesRepo(db);
const { jsPDF } = require('jspdf/dist/jspdf.node.min');

export class InvoiceService {
    async preSignedUrl(merchantId, fileInfo, isDna) {
        const { fileName, pdfFileType } = fileInfo;
        const acquirer = isDna ? 'dna' : 'non-dna';
        const path = `invoices/acquirer/${acquirer}/${merchantId}/${fileName}`;
        const s3Params = {
            Bucket: bucket,
            Key: path,
            Expires: EXPIRE_TIME_SECONDS,
            ContentType: pdfFileType,
            ACL: 'public-read'
        };
        const presignedUrl = await s3Client.getSignedUrlPromise('putObject', s3Params);
        return { presignedUrl };
    }

    async sendPaymentInvoiceByEmailOrPhone(event, merchantId, body) {
        const { Sequelize } = db;
        const { amount, description, cxInfo, recipientsEmail, currencySymbol, currencyCode, portalURL } = body;
        const { email, phone, firstName, lastName, quantity, dateOfExpiry, item, supplyDate } = cxInfo;
        if (
            !dateOfExpiry ||
            !supplyDate ||
            !item ||
            !firstName ||
            !lastName ||
            !quantity ||
            !dateOfExpiry ||
            !(email || phone) ||
            moment(supplyDate).endOf('D').isAfter(moment(dateOfExpiry).endOf('D'))
        ) {
            throw new Error('Invalid fields', 404);
        }
        const merchantInfo = await merchantRepo.findOne({
            where: { id: merchantId },
            include: [
                {
                    model: db.AcquirerAccountConfiguration,
                    where: {
                        merchantId: merchantId,
                        dnaMid: {
                            [Sequelize.Op.ne]: null
                        }
                    },
                    required: false
                },
                {
                    model: db.OwnersDetails,
                    attributes: ['email', 'contactPhone'],
                    include: {
                        model: db.Address,
                        as: 'OwnerAddress',
                        attributes: ['addressLine1', 'addressLine2', 'city', 'country', 'postCode']
                    }
                }
            ]
        });
        if (!merchantInfo) {
            throw new Error('Invalid Merchant', 404);
        }
        const invoiceExpiryDate = moment(dateOfExpiry).format('MM-DD-YYYY');
        const isDna = !!merchantInfo.AcquirerAccountConfigurations.length;
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
        const invoiceDto = {
            merchantId: merchantId,
            amount: amount * 100,
            description,
            email,
            phone,
            firstName,
            lastName,
            item,
            quantity,
            dateOfExpiry,
            supplyDate,
            receiptEmail: recipientsEmail
        };
        const invoice = await invoicesRepo.save(invoiceDto);
        const invoiceId = JSON.parse(JSON.stringify(invoice)).id;
        let linkForTheUserToPay = '';
        let gatewayparams = {};
        let gatewayResponse;
        if (isDna) {
            gatewayparams = {
                amount: +amount,
                currency_code: currencyCode,
                description,
                email: recipientsEmail || '',
                invoiceId: String(invoiceId),
                invoiceExpiryDate
            };
            gatewayResponse = await InitialiseDnaSale(event, merchantId, gatewayparams);
            linkForTheUserToPay = `${DATMAN_API_ENDPOINT}/portal/dna-redirect/${gatewayResponse}`;
        } else {
            gatewayparams = {
                amount: amount * 100,
                currency_code: currencyCode,
                user_order_ref: '',
                description: description,
                items: [],
                shoppers: {
                    first_name: '',
                    last_name: '',
                    email: email || '',
                    address: '',
                    recipients_email: recipientsEmail
                },
                invoiceId: String(invoiceId),
                invoiceExpiryDate
            };
            gatewayResponse = await InitialiseSale(event, merchantId, gatewayparams);
            linkForTheUserToPay = `${MYPAY_GATEWAY_LINK}/pay/${gatewayResponse}`;
        }
        const doc = new jsPDF('p', 'px', 'a4');
        const pdfPayload = await invoicePdfTemplate(
            linkForTheUserToPay,
            {
                ...cxInfo,
                amount: (+amount).toFixed(2),
                description,
                currencySymbol,
                logoUrl: reseller.logo,
                invoiceId,
                supplyDate
            },
            merchantInfo,
            doc
        );
        const documentId = flakeGenerateDecimal();
        const fileInfo = {
            fileName: `invoice_${merchantId}_${documentId}_.pdf`,
            fileType: 'application/pdf'
        };
        const awsPresignedUrl = await this.preSignedUrl(merchantId, fileInfo, isDna);
        let config = {
            method: 'put',
            url: awsPresignedUrl.presignedUrl,
            data: pdfPayload,
            headers: {
                'Content-type': 'application/pdf;charset=utf-8'
            }
        };
        const axios = Axios.create();
        await axios(config);
        const docLink = awsPresignedUrl.presignedUrl.split('?')[0];
        const invoiceTemplate = invoiceEmailTemplate(
            {
                amount: (+amount)?.toFixed(2),
                description,
                currencySymbol,
                invoiceId,
                dateOfExpiry: moment(dateOfExpiry).format('MMM DD, YYYY')
            },
            merchantInfo
        );
        if (email) {
            await sendEmail({
                email: email,
                subject: `Invoice for payment by ${merchantInfo.name}`,
                message: invoiceTemplate,
                resellerBrandingObj,
                attachments: [{ filename: `invoice.pdf`, path: docLink }]
            });
        }
        if (phone) {
            const smsText = `Please complete your payment by clicking on ${docLink}`;
            const headersToSendToGatewayMessagingService = {
                api_key: DATMAN_SES_HANDLER_API_KEY
            };
            const payloadToSendToGatewayMessagingService = {
                message_text: smsText,
                phone_number: phone,
                SenderId: portalURL?.includes('datmancrm') ? 'Datman' : 'OmniPay'
            };
            const smsAxios = Axios.create();
            await smsAxios.post(API_ENDPOINT_SEND_PAYMENT_VIA_SMS, payloadToSendToGatewayMessagingService, {
                headers: headersToSendToGatewayMessagingService
            });
        }
        return true;
    }
}

const InitialiseSale = async (event, merchantId, payload) => {
    const axios = Axios.create();
    const bytes = utf8.encode(merchantId.toString());
    const encodedMerchantId = base64.encode(bytes);
    const token = event.headers['Authorization'] || event.headers['authorization'];
    const config = {
        method: 'post',
        url: `${DATMAN_API_ENDPOINT}/portal/session/create`,
        headers: {
            Authorization: token + '!!!' + encodedMerchantId,
            'Content-Type': 'application/json'
        },
        data: payload
    };
    const response = await axios(config);
    const { data } = response;
    const { session_id } = data.data;
    return session_id;
};

const InitialiseDnaSale = async (event, merchantId, params) => {
    const axios = Axios.create();
    const bytes = utf8.encode(merchantId.toString());
    const encodedMerchantId = base64.encode(bytes);
    const token = event.headers['Authorization'] || event.headers['authorization'];
    const config = {
        method: 'get',
        url: `${DATMAN_API_ENDPOINT}/portal/dna-hosted-form`,
        headers: {
            Authorization: token + '!!!' + encodedMerchantId,
            'Content-Type': 'application/json'
        },
        params: params
    };
    const response = await axios(config);
    const { data } = response;
    const { uuid } = data.data;
    return uuid;
};
