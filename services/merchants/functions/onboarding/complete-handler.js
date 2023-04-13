require('dotenv').config();
import Axios from 'axios';
var { auditLogsPublisher } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../../layers/models_lib/src') : require('models');
var {
    response,
    sendEmail,
    onboardCompletionEmail,
    zohoDeskDatmanTipaltiOnboardingEmailTemplate,
    getUserId,
    middy,
    userAccessValidatorMiddleware
} = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');
var { MerchantRepo } = require('../../../../libs/repo/merchant.repo');
var { ResellerRepo } = require('../../../../libs/repo/reseller.repo');
var { RelationshipRepo } = require('../../../../libs/repo/relationship.repo');
var { OwnersDetailsRepo } = require('../../../../libs/repo/ownerdetails.repo');
const { MerchantStatus, MerchantStatusIdToName } = require('../../helpers/MerchantStatus');
var { AdyenMerchantMetadataRepo } = require('../../../../libs/repo/adyen-merchant-metadata-repo');
var { BusinessBankDetailsRepo } = require('../../../../libs/repo/business-bank-details.repo');
var { AddressRepo } = require('../../../../libs/repo/address.repo');
var { BusinessDetailRepo } = require('../../../../libs/repo/business-detail.repo');
var { UserRepo } = require('../../../../libs/repo/user.repo');
var { StripeService } = require('../../business-logic/stripe.service');
var { AcquirerAccountConfigurationRepo } = require('../../../../libs/repo/acquirer-account-configuration-repo');

const { AdyenAccountStatus } = require('../../helpers/adyen-status');
const { MerchantCountries } = require('../../helpers/MerchantCountries');
const { CountryISOCodeFromName, CountyCurrencyFromName } = require('../../helpers/county-to-country-code');
const { BusinessTypeEnumId } = require('../../helpers/businessType');
const { DatmanBusinessTypeIdToAdyenBusinessType } = require('../../helpers/adyen-to-datman-business-type-map');
const { TipaltiService } = require('../../business-logic/tipalti.service');
const { TipaltiBusinessType } = require('../../helpers/tipalti-business-type');
const { PaymentProviders } = require('../../helpers/payment_providers');
const { foodHubWebHook } = require('../../helpers/foodHubWebHookUrl');
const stripeService = new StripeService();
const tipaltiService = new TipaltiService();

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);
const merchantRepo = new MerchantRepo(db);
const resellerRepo = new ResellerRepo(db);
const relationshipRepo = new RelationshipRepo(db);
const ownersDetailsRepo = new OwnersDetailsRepo(db);
const adyenMerchantMetadataRepo = new AdyenMerchantMetadataRepo(db);
const businessBankDetailsRepo = new BusinessBankDetailsRepo(db);
const addressRepo = new AddressRepo(db);
const businessDetailRepo = new BusinessDetailRepo(db);
const userRepo = new UserRepo(db);
const acquirerAccountConfigurationRepo = new AcquirerAccountConfigurationRepo(db);
const ADYEN_API_KEY = process.env.ADYEN_API_KEY;
const ADYEN_API_URL = process.env.ADYEN_API_URL;
const ADYEN_SERVICE_BASE_URL = process.env.ADYEN_SERVICE_BASE_URL;

export const onboardingComplete = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;
        const merchant = await merchantRepo.findOne({
            where: {
                id: merchantId
            }
        });
        let auditLogData = [];
        if (!merchant) {
            return response({}, 404);
        }

        const userId = await getUserId(event);

        const user = await userRepo.findOne({
            where: {
                Id: userId
            }
        });

        const relationship = await relationshipRepo.findOne({
            where: {
                userId: userId,
                merchantId: merchant.id
            }
        });

        const reseller = await resellerRepo.findOne({
            where: {
                id: relationship.resellerId
            }
        });

        const ownersDetails = await ownersDetailsRepo.findOne({
            where: {
                id: merchant.primaryOwnerId
            }
        });

        const ownerAddressId = ownersDetails.ownerAddressId;
        const businessDetails = await businessDetailRepo.findOne({
            where: {
                id: merchant.businessDetailId
            }
        });

        const businessAddress = await addressRepo.findOne({
            where: {
                id: merchant.baseAddressId
            }
        });

        const ownerAddress = await addressRepo.findOne({
            where: {
                id: ownerAddressId
            }
        });

        const bankDetails = await businessBankDetailsRepo.findOne({
            where: {
                id: merchant.businessBankDetailsId
            }
        });
        // const isAdmin = user.typeId === 5 ? true : false;
        const isMerchant = user.typeId === 3 ? true : false;
        const adyenMerchant = await acquirerAccountConfigurationRepo.findOne({ where: { merchantId: merchantId } });

        if (
            adyenMerchant &&
            isMerchant &&
            adyenMerchant?.accountStatus !== AdyenAccountStatus.SUSPENDED &&
            adyenMerchant?.accountStatus !== AdyenAccountStatus.CLOSED
        ) {
            const bankData = [
                {
                    branchCode: bankDetails.sortCode,
                    accountNumber: bankDetails.newAccountNumber,
                    countryCode: CountryISOCodeFromName[merchant.country],
                    currencyCode: CountyCurrencyFromName[merchant.country],
                    bankName: bankDetails.nameOfBank,
                    ownerCity: ownerAddress.city?.trim() ? ownerAddress.city?.trim() : '-',
                    ownerCountryCode: CountryISOCodeFromName[merchant.country],
                    ownerHouseNumberOrName: ownerAddress.addressLine1,
                    ownerName: bankDetails.accountHolderName,
                    ownerPostalCode: ownerAddress.postCode,
                    ownerStreet: ownerAddress.addressLine2 ? ownerAddress.addressLine2 : '-',
                    bankAccountUUID: bankDetails.adyenBankUUID
                }
            ];

            const phoneNumberData = {
                phoneNumber: ownersDetails.contactPhone,
                phoneCountryCode: CountryISOCodeFromName[merchant.country]
            };

            let email = ownersDetails.email;
            const dateOfBirth = ownersDetails.birthDate;
            const webAddress = businessDetails?.websiteUrl
                ? businessDetails?.websiteUrl.includes('https')
                    ? businessDetails.websiteUrl
                    : `https://${businessDetails?.websiteUrl}`
                : null;

            const ownerAddressDto = {
                city: ownerAddress.city?.trim() ? ownerAddress.city?.trim() : '-',
                country: CountryISOCodeFromName[merchant.country],
                postalCode: ownerAddress.postCode,
                houseNumberOrName: ownerAddress.addressLine1,
                street: ownerAddress.addressLine2 ? ownerAddress.addressLine2 : '-'
            };

            var name = ownersDetails.fullName.split(' ');
            var firstName = name.shift('');
            var lastName = name.join(' ');

            const individualDetails = {
                name: {
                    firstName: firstName,
                    lastName: lastName
                },
                personalData: {
                    dateOfBirth: ownersDetails.birthDate
                }
            };

            const legalEntity = DatmanBusinessTypeIdToAdyenBusinessType[businessDetails.businessTypeId];
            // const processingTier = adyenLevel;

            let payLoad = {
                accountHolderCode: merchantId,
                accountHolderDetails: {
                    bankAccountDetails: bankData,
                    dateOfBirth: dateOfBirth
                },
                legalEntity: legalEntity
                // processingTier: processingTier
            };

            let shareholderCode;
            let signatoryCode;
            const adyenMerchantMetaData = await adyenMerchantMetadataRepo.findOne({
                where: { merchantId: merchantId }
            });

            if (businessDetails.businessTypeId === BusinessTypeEnumId.SOLE_TRADER) {
                payLoad = {
                    ...payLoad,
                    accountHolderDetails: {
                        ...payLoad.accountHolderDetails,
                        address: { ...ownerAddressDto },
                        individualDetails: { ...individualDetails },
                        phoneNumber: { ...phoneNumberData },
                        email: email
                    }
                };
            } else {
                const adyenMetadata = adyenMerchantMetaData?.metaData && JSON.parse(adyenMerchantMetaData?.metaData);
                shareholderCode = adyenMetadata?.shareholderCode;
                signatoryCode = adyenMetadata?.signatoryCode;
                const fullPhoneNumber = businessDetails.phoneNumber;
                const businessEmail = businessDetails.email;

                const businessDetailsDto = {
                    legalBusinessName: merchant.legalName,
                    doingBusinessAs: merchant.legalName,
                    registrationNumber: businessDetails.registeredNumber,
                    signatories: [
                        {
                            name: {
                                firstName: firstName,
                                lastName: lastName
                            },
                            address: { ...ownerAddressDto },
                            email: email,
                            jobTitle: 'President',
                            personalData: {
                                dateOfBirth: dateOfBirth,
                                nationality: CountryISOCodeFromName[merchant.country]
                            },
                            signatoryCode: signatoryCode
                        }
                    ],
                    shareholders: [
                        {
                            name: {
                                firstName: firstName,
                                lastName: lastName
                            },
                            address: { ...ownerAddressDto },
                            email: email,
                            shareholderType: 'Owner',
                            personalData: {
                                dateOfBirth: dateOfBirth,
                                nationality: CountryISOCodeFromName[merchant.country]
                            },
                            shareholderCode: shareholderCode
                        }
                    ]
                };

                const businessAddressDto = {
                    city: businessAddress.city?.trim() ? businessAddress.city?.trim() : '-',
                    country: CountryISOCodeFromName[merchant.country],
                    postalCode: businessAddress.postCode,
                    stateOrProvince: CountryISOCodeFromName[merchant.country],
                    houseNumberOrName: businessAddress.addressLine1,
                    street: businessAddress.addressLine2 ? businessAddress.addressLine2 : '-'
                };

                payLoad = {
                    ...payLoad,
                    accountHolderDetails: {
                        ...payLoad.accountHolderDetails,
                        address: { ...businessAddressDto },
                        businessDetails: { ...businessDetailsDto },
                        webAddress: webAddress,
                        fullPhoneNumber: fullPhoneNumber.startsWith('+') ? fullPhoneNumber : `+${fullPhoneNumber}`,
                        email: businessEmail
                    }
                };
            }

            try {
                const axios = Axios.create();

                var config = {
                    method: 'post',
                    url: `${ADYEN_API_URL}/Account/v6/updateAccountHolder`,
                    data: payLoad,
                    headers: {
                        'x-API-key': ADYEN_API_KEY,
                        'Content-Type': 'application/json'
                    }
                };

                const response = await axios(config);
                let transaction = await db.sequelize.transaction();
                try {
                    if (!signatoryCode || !shareholderCode) {
                        const dto = {
                            shareholderCode:
                                response?.data?.accountHolderDetails?.businessDetails?.shareholders[0]?.shareholderCode,
                            signatoryCode:
                                response?.data?.accountHolderDetails?.businessDetails?.signatories[0]?.signatoryCode
                        };

                        let adyenMetaDataDto = {
                            metaData: JSON.stringify({ dto })
                        };

                        if (adyenMerchantMetaData) {
                            const updatedAdyenMerchant = await adyenMerchantMetadataRepo.update(
                                adyenMerchantMetaData.id,
                                adyenMetaDataDto,
                                transaction
                            );
                            const adyenMerchantUpdateDto = {
                                beforeUpdate: adyenMerchantMetaData,
                                afterUpdate: updatedAdyenMerchant,
                                tableName: 'adyen_merchant_metadata'
                            };
                            auditLogData.push(adyenMerchantUpdateDto);
                        } else {
                            adyenMetaDataDto = {
                                merchantId: merchantId,
                                metaData: JSON.stringify(dto)
                            };
                            await adyenMerchantMetadataRepo.save(adyenMetaDataDto, transaction);
                        }
                    }
                    await transaction.commit();
                } catch (error) {
                    if (transaction) {
                        await transaction.rollback();
                    }
                    console.log('Adyen metadata saving error', error, error?.response);
                }
                console.log('Adyen update response', response.data);
            } catch (err) {
                const error = err?.response?.data?.invalidFields;
                console.log(`exception in adyen update data`, err, error);
            }
        }

        if (merchant.status !== MerchantStatus.ACTIVE) {
            //assuming t2s send eat appy clients ClientType='EAT-APPY' which we capture as merchant.signupLinkFrom
            let stripeAccountId;
            if (merchant.signupLinkFrom && merchant.signupLinkFrom === 'EAT-APPY') {
                stripeAccountId = await stripeService.createStripeAccount(ownersDetails.email, merchant.legalName);
            }

            const updatedMerchant = await merchantRepo.update(merchant.id, {
                onboardingStep: 1,
                status: reseller.name === 'Datman' ? MerchantStatus.ACTIVE : MerchantStatus.MERCHANT_PENDING,
                stripeId: stripeAccountId ? stripeAccountId : null
            });
            const merchantUpdateDto = {
                beforeUpdate: merchant,
                afterUpdate: updatedMerchant,
                tableName: 'merchants'
            };
            auditLogData.push(merchantUpdateDto);
            const auditLogDto = {
                data: {
                    auditLogData,
                    userId: userId,
                    merchantId: merchantId,
                    lambadaName: 'OnboardingComplete',
                    identity: event?.requestContext?.identity
                },
                queueUrl: process.env.AUDIT_LOGS_QUEUE_URL
            };
            await auditLogsPublisher(auditLogDto);

            // console.log('status====', merchant.status, 'mainStatus====', MerchantStatusIdToName[merchant.status]);
            const payLoad = JSON.stringify({
                merchant_id: updatedMerchant.id.toString(),
                accountStatus: MerchantStatusIdToName[updatedMerchant.status].toString(),
                payoutStatus:
                    updatedMerchant.isAccountVerified && updatedMerchant.isBankAccountVerified ? 'OPEN' : 'BLOCKED',
                provider: 'Datman',
                storeId: updatedMerchant.thirdPartyCustomer?.toString()
            });
            await foodHubWebHook(payLoad);
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

            const now = new Date();
            const formattedDateTime = `${now.toLocaleDateString()} at ${now.toTimeString().substr(0, 8)}`;
            const onboardCompletionDataObj = {
                ownerName: ownersDetails.fullName,
                merchantName: merchant.name,
                irn: merchant.id,
                dateTime: formattedDateTime
            };

            const completionTemplate = onboardCompletionEmail({ onboardCompletionDataObj, resellerBrandingObj });
            await sendEmail({
                email: 'info@datman.je',
                subject: 'Onboarding Submission is completed',
                message: completionTemplate,
                resellerBrandingObj
            });

            if (merchant.country === MerchantCountries.UNITED_STATES) {
                const zohoNotifyTipaltiOnboard = zohoDeskDatmanTipaltiOnboardingEmailTemplate({
                    onboardCompletionDataObj,
                    resellerBrandingObj
                });
                await sendEmail({
                    email: resellerBrandingObj.email,
                    subject: 'USA Account onboarding completed',
                    message: zohoNotifyTipaltiOnboard,
                    resellerBrandingObj
                });
            }
        }

        if (merchant.country === MerchantCountries.UNITED_STATES) {
            let name = ownersDetails.fullName.split(' ');
            let firstName = name.shift('');
            let lastName = name.join(' ');

            const tipaltiPayload = {
                merchantId: merchant.id,
                legalName: merchant.legalName,
                firstName: firstName,
                lastName: lastName,
                city: ownerAddress.city?.trim() ? ownerAddress.city?.trim() : '-',
                country: CountryISOCodeFromName[merchant.country],
                zipCode: ownerAddress.postCode,
                street1: ownerAddress.addressLine1,
                street2: ownerAddress.addressLine2 ? ownerAddress.addressLine2 : '-',
                email: ownersDetails.email,
                accountHolderName: bankDetails.accountHolderName,
                payeeEntityType: TipaltiBusinessType[businessDetails.businessTypeId],
                erpCurrency: CountyCurrencyFromName[merchant.country]
            };

            await tipaltiService.onboardToTipalti(tipaltiPayload);
        }

        const merchantProviders = merchant.providers ? JSON.parse(merchant.providers) : [];
        if (
            merchantProviders.includes(PaymentProviders.ADYEN) &&
            merchant.country === MerchantCountries.UNITED_KINGDOM
        ) {
            // call adyen api
            try {
                const axios = Axios.create();
                var onboardingConfig = {
                    method: 'post',
                    data: JSON.stringify({ fhOnboarding: true }),
                    url: `${ADYEN_SERVICE_BASE_URL}/adyen-onboarding/${merchantId}/2/1`,
                    headers: {
                        Authorization: event.headers['Authorization'],
                        'Content-Type': 'application/json'
                    }
                };
                await axios(onboardingConfig);
            } catch (error) {
                const err = error?.response?.data || error;
                console.log('Adyen automatic onboarding error', err);
            }
        }

        return response({}, 200);
    } catch (error) {
        console.error(error);
        return response({}, 500);
    }
}).use(userAccessValidatorMiddleware());
