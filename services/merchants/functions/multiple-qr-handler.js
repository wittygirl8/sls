var { constants, isUUID } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');

var { MultipleQrService } = require('../business-logic/multiple-qr.service');
var { BusinessDetailsService } = require('../business-logic/business-details.service');

const multipleQrService = new MultipleQrService();
const businessDetailsService = new BusinessDetailsService();

export const multipleQrPayment = async (event) => {
    const encodeToBase64 = (data) => {
        let encoded = Buffer.from(data).toString('base64');
        return encoded;
    };

    const responseHtml = (message) => {
        return `<html>

        <head>
            <title>Omnipay</title>
            <style>
                #inner {
                    margin: 0 auto;
                    padding: 20px;
                }

                #outer {
                    width: 100%
                }
        
                .heading {
                    text-align: center;
                }
            </style>
        </head>
        
        <body>
            <div id="outer">
                <div id="inner">
                    <h3 class="heading">Sorry for inconvenience</h3>
                    <p class="heading">${message}</p>
                </div>
            </div>
        </body>
        
        </html>`;
    };

    try {
        const uuid = event.pathParameters.uuid;

        if (!isUUID(uuid)) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'text/html',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true
                },
                body: await responseHtml('Invalid QR!')
            };
        }

        const checkForQRLink = await multipleQrService.getById(uuid);

        if (!checkForQRLink) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'text/html',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true
                },
                body: await responseHtml('QR Code not found!')
            };
        }

        const { merchantId, baseURL, status } = checkForQRLink;
        /**
         * If we get the merchantId that means UUID (QR CODE) is linked to that particular merchant
         * If we get merchantId as undefined or null that means first we have to link merchant so redirect to CP for linking
         */
        if (merchantId) {
            //redirect to payment page before that populate payment data
            //https://www.gateway.omni-pay.com/paybrqr/uuid
            //Status 301 for move permanently
            // use below encoded merchant for testing on local
            // let encodedMerchantData = 'eyJpZCI6NjYzMTgxMDAxLCJidXNpbmVzc19uYW1lIjoiTXlDYWZlIEluYyIsImNsaWVudHNfZm5hbWUiOiJOYXZlZW4iLCJjbGllbnRzX3NuYW1lIjoiWWFkYXYiLCJjdXN0b21lcl90eXBlIjoiREFUTUFOIn0='; //has to be encoded in base24 - only merchant Info

            if (status === 'inactive') {
                return {
                    statusCode: 301,
                    headers: {
                        'Content-Type': 'text/html',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Credentials': true
                    },
                    body: await responseHtml('Inactive Merchant!')
                };
            }

            const merchantData = await businessDetailsService.getBusinessDetails(merchantId); //Use 20 for testing

            const infoCheck =
                merchantData.businessDetails.legalName && merchantData.ownerDetails.fullName ? true : false;

            if (!infoCheck) {
                return {
                    statusCode: 500,
                    headers: {
                        'Content-Type': 'text/html',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Credentials': true
                    },
                    body: await responseHtml('Merchant info missing!')
                };
            }

            let name = merchantData.ownerDetails.fullName;
            let firstName = name.includes(' ') ? name.split(' ')[0] : name;
            let lastName = name.replace(firstName, '');

            let merchantDtoForEncoding = {
                business_name: merchantData.businessDetails.legalName,
                clients_fname: firstName,
                clients_sname: lastName,
                customer_type: 'OMNIPAY'
            };
            let merchantDto = JSON.stringify(merchantDtoForEncoding);
            let encodedMerchantData = encodeToBase64(merchantDto);

            const redirection = `${baseURL}/paybyqr/v2/${uuid}?data=${encodedMerchantData}`;

            let body = JSON.stringify({
                status: true,
                message: 'redirect',
                data: {
                    redirection: true
                }
            });

            return {
                statusCode: 301,
                headers: {
                    Location: redirection,
                    'cache-control': 'no-cache',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true
                },
                body: body
            };
        } else {
            const { OMNI_PAY } = constants.ResellerValues;
            const reseller = await multipleQrService.getResellerDetails(OMNI_PAY);
            let portalLink = process.env.WEB_CLIENT_URL;
            let redirection = '';

            if (process.env.IS_OFFLINE) {
                //for local CP Frontend
                redirection = `${portalLink}/portal.omni-pay.com/linkQr?data=${uuid}`;
            } else {
                //for dev and prod, release CP Frontend
                if (process.env.CUSTOM_DOMAINS) {
                    for (let domain of process.env.CUSTOM_DOMAINS.split(',')) {
                        if (domain.includes(reseller.portalURL)) {
                            portalLink = domain;
                            break;
                        }
                    }
                }

                redirection = `${portalLink}/linkQr?data=${uuid}`;
            }

            let body = JSON.stringify({
                status: true,
                message: 'redirect',
                data: {
                    redirection: true
                }
            });

            return {
                statusCode: 301,
                headers: {
                    Location: redirection,
                    'Cache-Control': 'no-store',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true
                },
                body: body
            };
        }
    } catch (err) {
        console.log({ err });
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'text/html',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: await responseHtml(err)
        };
    }
};
