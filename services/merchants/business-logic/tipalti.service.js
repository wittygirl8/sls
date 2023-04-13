const axios = require('axios');
const convert = require('xml-js');
const CryptoJS = require('crypto-js');

export class TipaltiService {
    async onboardToTipalti(payLoad) {
        const jsonTipaltiPayload = generateTiplatiOnboardingPayload(payLoad);
        const xmlTipaltiPayload = convert.json2xml(jsonTipaltiPayload, { compact: true });
        console.log('Tipalti onboarding payload', xmlTipaltiPayload);

        var config = {
            method: 'post',
            url: `${process.env.TIPALTI_API_DOMAIN}/payeefunctions.asmx`,
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                SOAPAction: 'http://Tipalti.org/UpdateOrCreatePayeeInfo'
            },
            data: xmlTipaltiPayload
        };

        return await axios(config)
            .then(function (response) {
                console.log('Tipalti api response', response.data);
                return {
                    status: true,
                    http_code: response.status,
                    data: JSON.parse(convert.xml2json(response.data, { compact: true }))
                };
            })
            .catch(function (error) {
                return { status: false, error };
            });
    }
}

const generateTiplatiOnboardingPayload = (payLoad) => {
    let payerName = 'FoodHubUSA'; //this should be configured in aws ssm
    let currentTime = Math.round(new Date().getTime() / 1000);

    let street1 = payLoad.street1;
    let msg = payerName + payLoad.merchantId + currentTime + street1;

    let messageSignature = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, process.env.TIPALTI_API_TOKEN)
        .update(msg)
        .finalize()
        .toString();

    return {
        _declaration: {
            _attributes: {
                version: '1.0',
                encoding: 'utf-8'
            }
        },
        'soap:Envelope': {
            _attributes: {
                'xmlns:soap': 'http://schemas.xmlsoap.org/soap/envelope/'
            },
            'soap:Body': {
                UpdateOrCreatePayeeInfo: {
                    _attributes: {
                        xmlns: 'http://Tipalti.org/'
                    },
                    payerName: {
                        _text: payerName
                    },
                    timestamp: {
                        _text: currentTime
                    },
                    idap: {
                        _text: payLoad.merchantId
                    },
                    overridePayableCountry: {
                        _text: false
                    },
                    key: {
                        _text: messageSignature
                    },
                    skipNulls: {
                        _text: true
                    },
                    item: {
                        Idap: {
                            _text: payLoad.merchantId
                        },
                        FirstName: {
                            _text: payLoad.firstName
                        },
                        LastName: {
                            _text: payLoad.lastName
                        },
                        Street1: {
                            _text: payLoad.street1
                        },
                        Street2: {
                            _text: payLoad.street2
                        },
                        City: {
                            _text: payLoad.city
                        },
                        Zip: {
                            _text: payLoad.zipCode
                        },
                        Country: {
                            _text: payLoad.country
                        },
                        Email: {
                            _text: payLoad.email
                        },
                        PayerEntityName: {
                            _text: payLoad.accountHolderName
                        },
                        CountryName: {
                            _text: payLoad.country
                        },
                        ErpCurrency: {
                            _text: payLoad.erpCurrency
                        },
                        PayeeEntityType: {
                            _text: payLoad.payeeEntityType
                        },
                        SendSupplierPortalInvite: {
                            _text: false
                        },
                        Company: {
                            _text: payLoad.legalName
                        }
                    }
                }
            }
        }
    };
};
