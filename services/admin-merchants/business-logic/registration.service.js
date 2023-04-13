var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
var {
    sendEmail,
    createUserWithTemporaryPassword,
    getClientRegistrationWelcomeEmail,
    MerchantStatus,
    notifyCanonicalResellerForAddedMerchantEmailTemplate,
    canonicalResellerInvitedMerchantEmailTemplate,
    getUserId,
    newMerchantAddByResellerEmailTemplate
} = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');

const {
    MerchantRepo,
    UserRoleRepo,
    ResellerRepo,
    RelationshipRepo,
    UserRepo,
    OwnersDetailsRepo,
    AddressRepo,
    MerchantProductRequiredRepo,
    PaymentsConfigurationRepo,
    BusinessDetailRepo,
    MerchantBusinessDescriptionRepo,
    TermsAndConditionsMapRepo,
    TermsAndConditionsRepo
} = require('../../../libs/repo');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);
const merchantRepo = new MerchantRepo(db);
const userRoleRepo = new UserRoleRepo(db);
const resellerRepo = new ResellerRepo(db);
const relationshipRepo = new RelationshipRepo(db);
const userRepo = new UserRepo(db);
const ownersDetailsRepo = new OwnersDetailsRepo(db);
const addressRepo = new AddressRepo(db);
const merchantProductRequiredRepo = new MerchantProductRequiredRepo(db);
const paymentsConfigurationRepo = new PaymentsConfigurationRepo(db);
const businessDetailRepo = new BusinessDetailRepo(db);
const merchantBusinessDescriptionRepo = new MerchantBusinessDescriptionRepo(db);
const termsAndConditionsMapRepo = new TermsAndConditionsMapRepo(db);
const termsAndConditionsRepo = new TermsAndConditionsRepo(db);
export class RegistrationService {
    async getUser(email) {
        const user = await userRepo.findOne({
            where: {
                email: email
            }
        });
        return user;
    }

    async newClientRegistration(event) {
        const { sequelize } = db;
        let transaction = await sequelize.transaction();
        let transaction2 = await sequelize.transaction();
        try {
            const body = JSON.parse(event.body);
            body.email = body.tempContactDetails.email;
            event.body = JSON.stringify(body);

            //CS customere and merchant creation
            var csData = {
                customerName: body.businessDetails.legalName,
                companyType: 'Merchant Services',
                contactName: body.tempContactDetails.legalName,
                contactAddress: body.tempContactDetails.addressLine,
                contactTown: body.tempContactDetails.city,
                contactCounty: body.tempContactDetails.country,
                contactPostcode: body.tempContactDetails.postCode,
                contactCountryCode: 'GB',
                contactPhone: body.tempContactDetails.telephoneNumber,
                contactEmail: body.tempContactDetails.email,
                merchantName: body.businessDetails.legalName,
                url: body.businessDetails.url,
                status: 'active',
                testMode: body.configDetails.testMode,
                threeDSEnabled: body.configDetails.threeDSecure,
                threeDSRequired: body.configDetails.threeDSecure,
                supportedCurrencies: 'GBP',
                acquirerBankName: body.configDetails.acquireBank,
                processorMerchantID: body.configDetails.merchantId,
                notifyEmail: body.tempContactDetails.email,
                processorID: body.configDetails.processorId.toString(),
                merchantCategoryCode: body.businessDetails.mccCode
            };

            const merchant = await merchantRepo.save(
                {
                    name: body.businessDetails.legalName,
                    legalName: body.businessDetails.legalName,
                    isAccountVerified: '1',
                    isBankAccountVerified: '1'
                },
                transaction
            );

            await cardStreamQueue(
                event.headers['Authorization'] || event.headers['authorization'],
                csData,
                merchant.id,
                body.configDetails.terminalId
            );

            const reseller = await resellerRepo.findOne({
                where: {
                    id: body.resellerId
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
                supportEmail: reseller.suportEmail,
                brandingURL: reseller.brandingURL,
                senderEmail: reseller.senderEmail,
                website: reseller.website,
                address: reseller.address
            };
            //ueser creation
            const tempPassword = await createUserWithTemporaryPassword(
                event,
                db,
                connectDB,
                true,
                resellerBrandingObj.portalURL
            );
            const user = await userRepo.findOne({
                where: {
                    email: body.tempContactDetails.email
                }
            });
            const userRole = await userRoleRepo.findOne({
                where: {
                    name: 'Owner'
                }
            });
            await createUserRelationship(user.id, merchant.id, userRole.id, transaction, body.resellerId);

            const ownerAddressDto = {
                phoneNumber: body.tempContactDetails.telephoneNumber,
                city: body.tempContactDetails.city,
                country: body.tempContactDetails.country,
                postCode: body.tempContactDetails.postCode,
                addressLine1: body.tempContactDetails.addressLine
            };

            const primaryOwnerAddressId = (await addressRepo.save(ownerAddressDto, transaction)).id;
            const primaryOwnerDto = {
                fullName: body.tempContactDetails.legalName,
                nationality: body.tempContactDetails.country,
                email: body.tempContactDetails.email,
                contactPhone: body.tempContactDetails.telephoneNumber,
                ownerAddressId: primaryOwnerAddressId
            };

            const primaryOwnerId = (await ownersDetailsRepo.save(primaryOwnerDto, transaction)).id;

            const businessDetailsDto = {
                websiteUrl: body.businessDetails.url
            };

            const merchantBusinessDescriptionDto = {
                merchantId: merchant.id,
                businessDescriptionId: body.businessDetails.businessDescription
            };
            await merchantBusinessDescriptionRepo.save(merchantBusinessDescriptionDto, transaction);

            const businessDetailsId = (await businessDetailRepo.save(businessDetailsDto, transaction)).id;

            await createProductsRelationships(merchant.id, body.selectedProducts, transaction);

            let portalLink = process.env.WEB_CLIENT_URL;
            if (process.env.CUSTOM_DOMAINS) {
                for (let domain of process.env.CUSTOM_DOMAINS.split(',')) {
                    if (domain.includes(reseller.portalURL)) {
                        portalLink = domain;
                        break;
                    }
                }
            }
            let locationStartPath = process.env.CUSTOM_DOMAINS
                ? portalLink
                : `${portalLink}/${encodeURIComponent(reseller.portalURL)}`;

            let emailText = getClientRegistrationWelcomeEmail(resellerBrandingObj);

            const subject = 'Welcome to OmniPay';
            const changePasswordLink = `${locationStartPath}/signup?email=${encodeURIComponent(
                body.email
            )}&phone=${encodeURIComponent(body.tempContactDetails.telephoneNumber)}&oldPassword=${encodeURIComponent(
                tempPassword
            )}`;
            const requestForSupportLink = `${locationStartPath}/request-support-form?merchantId=${encodeURIComponent(
                merchant.id
            )}`;

            emailText = emailText.replace(new RegExp('##user_name##', 'g'), body.tempContactDetails.legalName);
            emailText = emailText.replace(new RegExp('##user_email_address##', 'g'), body.email);
            emailText = emailText.replace(new RegExp('##change_password_link##', 'g'), changePasswordLink);
            emailText = emailText.replace(new RegExp('##request_for_support##', 'g'), requestForSupportLink);

            await sendEmail({
                email: body.email,
                subject: subject,
                message: emailText,
                resellerBrandingObj
            });
            await transaction.commit();
            await merchantRepo.update(
                merchant.id,
                {
                    primaryOwnerId: primaryOwnerId,
                    businessDetailId: businessDetailsId,
                    status: MerchantStatus.ACTIVE,
                    canonicalResellerId: 1
                },
                transaction2
            );
            await transaction2.commit();
        } catch (err) {
            if (transaction) {
                await transaction.rollback();
            }

            throw err;
        }
    }

    async newCanonicalMerchantRegistrations(event) {
        const { sequelize } = db;
        let transaction = await sequelize.transaction();
        let transaction2 = await sequelize.transaction();
        try {
            const body = JSON.parse(event.body);
            body.email = body.externalMerchantEmail;
            event.body = JSON.stringify(body);

            const merchantId = body.merchantId;
            let merchant;
            if (merchantId) {
                merchant = await merchantRepo.findOne({
                    where: {
                        id: merchantId
                    }
                });
            }

            let merchantBusinessDescription;
            let paymentsConfiguration;
            let baseAddressId;
            let businessDetailId;
            let primaryOwnerId;
            let merchantProductRequired;

            if (!merchant) {
                merchant = await merchantRepo.save(
                    {
                        name: body.externalMerchantName,
                        legalName: body.externalLegalName,
                        isAccountVerified: '1',
                        isBankAccountVerified: '1'
                    },
                    transaction
                );
            } else {
                baseAddressId = merchant.baseAddressId;
                businessDetailId = merchant.businessDetailId;
                primaryOwnerId = merchant.primaryOwnerId;

                merchantBusinessDescription = await merchantBusinessDescriptionRepo.findOne({
                    where: { merchantId: merchant.id }
                });
                paymentsConfiguration = await paymentsConfigurationRepo.findOne({
                    where: { merchantId: merchant.id }
                });
                merchantProductRequired = await merchantProductRequiredRepo.findAll({
                    where: { merchantId: merchant.id }
                });
            }

            const businessAddressDto = {
                phoneNumber: body.externalMerchantPhone,
                city: body.externalMidCity,
                country: body.country,
                postCode: body.externalMidPostCode,
                addressLine1: body.externalMidAddressLine1,
                addressLine2: body.externalMidAddressLine2,
                county: body.externalMidCounty
            };

            const primaryOwnerDto = {
                fullName: body.externalContactName,
                nationality: body.country,
                email: body.externalMerchantEmail
            };

            const businessDetailsDto = {
                email: body.externalMerchantEmail,
                websiteUrl: body.websiteUrl,
                tradingName: body.externalMerchantName,
                phoneNumber: body.externalMerchantPhone
            };

            const merchantBusinessDescriptionDto = {
                merchantId: merchant.id,
                businessDescriptionId: body.businessDescription
            };

            let paymentsConfigurationDto = {
                merchantId: merchant.id,
                acquirerBank: body.selectedAcquirer ? body.selectedAcquirer[0] : null,
                testMode: body.testMode || 1,
                threeDSecure: body.threeDSecure || 1,
                processorId: body.processorId ? body.processorId.toString() : 5,
                mid: body.externalMID
            };

            if (baseAddressId) {
                await addressRepo.update(merchant.baseAddressId, businessAddressDto, transaction);
            } else {
                baseAddressId = (await addressRepo.save(businessAddressDto, transaction)).id;
            }

            if (businessDetailId) {
                const businessDetail = await businessDetailRepo.findOne({
                    where: {
                        id: merchant.businessDetailId
                    }
                });
                await businessDetailRepo.update(businessDetail, businessDetailsDto, transaction);
            } else {
                businessDetailId = (await businessDetailRepo.save(businessDetailsDto, transaction)).id;
            }

            if (primaryOwnerId) {
                await ownersDetailsRepo.update(merchant.primaryOwnerId, primaryOwnerDto, transaction);
            } else {
                primaryOwnerId = (await ownersDetailsRepo.save(primaryOwnerDto, transaction)).id;
            }

            const termsAndCondition = await termsAndConditionsRepo.findOne({
                where: { canonicalResellerId: body.canonicalResellerId, status: 'active' }
            });

            if (termsAndCondition) {
                const applicableTermsAndConditionDto = {
                    tcId: termsAndCondition.id,
                    merchantId: merchant.id,
                    belongsTo: 'merchant'
                };

                await termsAndConditionsMapRepo.save(applicableTermsAndConditionDto, transaction);
            }

            const callCardStream =
                body.externalLegalName &&
                body.externalContactName &&
                body.externalMerchantPhone &&
                body.externalMerchantEmail &&
                body.externalMerchantName &&
                body.websiteUrl &&
                body.selectedAcquirer &&
                body.externalMID &&
                body.externalMidCity &&
                body.externalMidAddressLine1 &&
                body.externalMidAddressLine2;

            const shouldCallCsAPI = paymentsConfiguration
                ? !paymentsConfiguration.csCustomerId && !paymentsConfiguration.csMerchantId
                : true;

            if (callCardStream && shouldCallCsAPI) {
                let csData = {
                    customerName: body.externalLegalName,
                    companyType: 'Merchant Services',
                    contactName: body.externalContactName,
                    contactAddress: `${body.externalMidAddressLine1} ${body.externalMidAddressLine2}`,
                    contactTown: body.externalMidCity,
                    contactCounty: 'United Kingdom',
                    contactPostcode: body.externalMidPostCode,
                    contactCountryCode: 'GB',
                    contactPhone: body.externalMerchantPhone,
                    contactEmail: body.externalMerchantEmail,
                    merchantName: body.externalMerchantName,
                    url: body.websiteUrl,
                    status: 'active',
                    testMode: body.testMode,
                    threeDSEnabled: body.threeDSecure,
                    threeDSRequired: body.threeDSecure,
                    supportedCurrencies: 'GBP',
                    acquirerBankName: body.selectedAcquirer[0],
                    processorMerchantID: body.externalMID.toString(),
                    notifyEmail: body.externalMerchantEmail,
                    processorID: body.processorId ? body.processorId.toString() : '5',
                    merchantCategoryCode: body.mccCode
                };

                try {
                    await cardStreamQueue(
                        event.headers['Authorization'] || event.headers['authorization'],
                        csData,
                        merchant.id
                    );
                } catch (error) {
                    console.log(error);
                }
            }

            if (!paymentsConfiguration) {
                await paymentsConfigurationRepo.save(paymentsConfigurationDto, transaction);
            }

            if (body.businessDescription) {
                if (merchantBusinessDescription) {
                    await merchantBusinessDescriptionRepo.update(
                        merchantBusinessDescription.id,
                        merchantBusinessDescriptionDto,
                        transaction
                    );
                } else {
                    await merchantBusinessDescriptionRepo.save(merchantBusinessDescriptionDto, transaction);
                }
            }

            if (body.selectedMidType && body.selectedMidType.length !== 0) {
                if (merchantProductRequired) {
                    await updateProducts({
                        merchantId: merchant.id,
                        itemsIds: body.selectedMidType,
                        repository: merchantProductRequiredRepo,
                        propertyName: 'productRequiredId',
                        transaction: transaction
                    });
                } else {
                    await createProductsRelationships(merchant.id, body.selectedMidType, transaction);
                }
            }

            if (MerchantStatus.ACTIVE === body.merchantStatus) {
                const reseller = await resellerRepo.findOne({
                    where: {
                        id: body.resellerId
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
                    supportEmail: reseller.suportEmail,
                    brandingURL: reseller.brandingURL,
                    senderEmail: reseller.senderEmail,
                    website: reseller.website,
                    address: reseller.address
                };

                //ueser creation
                const tempPassword = await createUserWithTemporaryPassword(
                    event,
                    db,
                    connectDB,
                    true,
                    resellerBrandingObj.portalURL
                );

                const userId = await getUserId(event);
                const user = await userRepo.findByPk(userId);

                const invitedUser = await userRepo.findOne({
                    where: {
                        email: body.externalMerchantEmail
                    }
                });

                const userRole = await userRoleRepo.findOne({
                    where: {
                        name: 'Owner'
                    }
                });

                await createUserRelationship(invitedUser.id, merchant.id, userRole.id, transaction, body.resellerId);

                let portalLink = process.env.WEB_CLIENT_URL;
                if (process.env.CUSTOM_DOMAINS) {
                    for (let domain of process.env.CUSTOM_DOMAINS.split(',')) {
                        if (domain.includes(reseller.portalURL)) {
                            portalLink = domain;
                            break;
                        }
                    }
                }
                let locationStartPath = process.env.CUSTOM_DOMAINS
                    ? portalLink
                    : `${portalLink}/${encodeURIComponent(reseller.portalURL)}`;

                const changePasswordLink = `${locationStartPath}/signup?email=${encodeURIComponent(
                    body.externalMerchantEmail
                )}&phone=${encodeURIComponent(body.externalMerchantPhone)}&oldPassword=${encodeURIComponent(
                    tempPassword
                )}`;

                const notifyEmailTemplateParams = {
                    merchantName: body.externalMerchantName,
                    resellerName: resellerBrandingObj.resellerName,
                    contactUsPageURL: resellerBrandingObj.resellerContactUsPage
                };

                const merchantInviteEmailTemplateParams = {
                    contactName: body.externalContactName,
                    resellerName: resellerBrandingObj.resellerName,
                    portalUrl: resellerBrandingObj.portalURL,
                    canonicalResellerEmail: user.email,
                    changePasswordLink: changePasswordLink,
                    contactUsPageURL: resellerBrandingObj.resellerContactUsPage
                };

                const zohoAdminNotifynewMerchantParams = {
                    canonicalResellerEmail: user.email,
                    merchantName: body.externalMerchantName,
                    resellerName: resellerBrandingObj.resellerName,
                    merchantId: merchant.id,
                    portalUrl: resellerBrandingObj.portalURL
                };

                const notifyEmailTemplate = notifyCanonicalResellerForAddedMerchantEmailTemplate(
                    notifyEmailTemplateParams
                );
                const merchantInviteEmailTemplate = canonicalResellerInvitedMerchantEmailTemplate(
                    merchantInviteEmailTemplateParams
                );

                const zohoAdminNotifynewMerchant = newMerchantAddByResellerEmailTemplate(
                    zohoAdminNotifynewMerchantParams
                );

                await sendEmail({
                    email: user.email,
                    subject: 'New merchant added',
                    message: notifyEmailTemplate,
                    resellerBrandingObj
                });

                await sendEmail({
                    email: body.externalMerchantEmail,
                    subject: `Welcome to ${resellerBrandingObj.resellerName} team`,
                    message: merchantInviteEmailTemplate,
                    resellerBrandingObj
                });

                await sendEmail({
                    email: resellerBrandingObj.email,
                    subject: 'New merchant added',
                    message: zohoAdminNotifynewMerchant,
                    resellerBrandingObj
                });
            }

            await transaction.commit();

            await merchantRepo.update(
                merchant.id,
                {
                    legalName: body.externalLegalName,
                    name: body.externalMerchantName,
                    primaryOwnerId: primaryOwnerId,
                    businessDetailId: businessDetailId,
                    baseAddressId: baseAddressId,
                    status: body.merchantStatus,
                    canonicalResellerId: body.canonicalResellerId,
                    country: body.country
                },
                transaction2
            );
            await transaction2.commit();
        } catch (err) {
            if (transaction) {
                await transaction.rollback();
            }

            throw err;
        }
    }
}

async function createUserRelationship(userId, merchantId, roleId, transaction, resellerId) {
    const relationshipDto = {
        userId: userId,
        clientId: null,
        merchantId: merchantId,
        roleId: roleId,
        resellerId: resellerId
    };

    await relationshipRepo.save(relationshipDto, transaction);
}

async function createProductsRelationships(merchantId, products, transaction) {
    for (var i = 0; i < products.length; ++i) {
        const product = products[i];

        const productDto = {
            merchantId: merchantId,
            productRequiredId: product
        };

        await merchantProductRequiredRepo.save(productDto, transaction);
    }
}

const updateProducts = async (params) => {
    const { merchantId, itemsIds, repository, propertyName, transaction } = params;

    const existingItems = await repository.findAll({
        where: {
            merchantId: merchantId
        }
    });

    const newItems = itemsIds.filter((id) => !existingItems.some((e) => e[propertyName] === id));

    const deletedItems = existingItems
        .filter((e) => !itemsIds.some((id) => id === e[propertyName]))
        .map((e) => e[propertyName]);

    const deleteQuery = {
        where: {
            merchantId: merchantId
        }
    };
    deleteQuery.where[propertyName] = deletedItems;

    await repository.deleteAll(deleteQuery);

    for (var i = 0; i < newItems.length; ++i) {
        const itemId = newItems[i];

        const saveQuery = {
            merchantId: merchantId
        };
        saveQuery[propertyName] = itemId;

        await repository.save(saveQuery, transaction);
    }
};

const cardStreamQueue = async (token, csData, merchantId, terminalId = null) => {
    let options = {};
    const data = JSON.stringify({
        csData: { ...csData },
        token: token,
        merchantId: merchantId,
        terminalId: terminalId
    });
    let QueueUrl = process.env.CARD_STREAM_ACCOUNT_CREATION_QUEUE_URL;
    if (process.env.IS_OFFLINE) {
        options = {
            apiVersion: '2012-11-05',
            region: 'localhost',
            endpoint: 'http://0.0.0.0:9324',
            sslEnabled: false
        };
    }
    const sqs = new AWS.SQS(options);
    const params = {
        MessageGroupId: uuidv4(),
        MessageBody: data,
        QueueUrl: QueueUrl
    };

    const res = await sqs.sendMessage(params).promise();
    console.log(res);
};
