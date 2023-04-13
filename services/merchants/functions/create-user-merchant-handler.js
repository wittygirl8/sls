require('dotenv').config();
var { response, getUserId } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

import { UserRepo, PaymentsConfigurationRepo, AddressRepo, MerchantRepo } from '../../../libs/repo';
var { EmailNotifyNewMerchantService } = require('../business-logic/email-notify-new-merchant.service');
var { RefferalDataService } = require('../business-logic/referal-data.service');
const { MerchantLabel } = require('../helpers/MerchantLabel');
const { Op } = db.Sequelize;
const emailNotifyNewMerchantService = new EmailNotifyNewMerchantService();
const refferalDataService = new RefferalDataService();
const userRepo = new UserRepo(db);
const addressRepo = new AddressRepo(db);
const paymentsConfigurationRepo = new PaymentsConfigurationRepo(db);
const merchantRepo = new MerchantRepo(db);
const { MerchantCountries } = require('../helpers/MerchantCountries');
const { foodHubWebHook } = require('../helpers/foodHubWebHookUrl');

export const createUserMerchant = async (event) => {
    let transaction;
    let isCanonicalResellerUser;
    let merchantEntity;

    try {
        const userId = await getUserId(event);
        const body = JSON.parse(event.body);
        const {
            name,
            country,
            extMidAddress,
            extConfigDetails,
            resellerId,
            canonicalResellerId,
            thirdPartyCustomerId,
            refferalDataValue,
            host
        } = body;
        const user = await userRepo.findByPk(userId);
        if (user) {
            isCanonicalResellerUser = user.typeId === 4 ? true : false;
        }
        const countMerchant = await db.Merchant.count({
            where: {
                clientId: { [Op.eq]: null },
                name: name
            },
            include: [
                {
                    model: db.Relationship,
                    where: {
                        userId: userId,
                        resellerId: resellerId
                    }
                }
            ]
        });

        if (countMerchant > 0) {
            return response('Merchant name already exists.', 400);
        }

        if (+resellerId === 2) {
            //For Datman, Max 1 merchant can be there
            const countExistingMerchants = await db.Merchant.count({
                where: {
                    clientId: { [Op.eq]: null }
                },
                include: [
                    {
                        model: db.Relationship,
                        where: {
                            userId: userId,
                            resellerId: resellerId
                        }
                    }
                ]
            });

            if (countExistingMerchants > 0) {
                return response('Merchant already exists for your account.', 400);
            }
        }

        transaction = await db.sequelize.transaction();

        var userRole = await db.Role.findOne({
            where: {
                name: 'Owner'
            }
        });
        if (!isCanonicalResellerUser) {
            let canonicalResellerIdForNewRegistration = canonicalResellerId || null;

            //For Datman registrations, these Datman merchants should go under Datman reseller
            if (!canonicalResellerIdForNewRegistration && resellerId == 2) {
                canonicalResellerIdForNewRegistration = 2; //canonical reseller id matches with reseller ids
            }

            const autoWithdrawStatus = country === MerchantCountries.UNITED_KINGDOM ? '1' : '0';

            merchantEntity = await db.Merchant.create(
                {
                    clientId: null,
                    name: name,
                    country: country,
                    label: MerchantLabel.SENDER,
                    thirdPartyCustomer: thirdPartyCustomerId,
                    host: host,
                    canonicalResellerId: 2,
                    autoWithdraw: autoWithdrawStatus,
                    Relationships: [
                        {
                            userId: userId,
                            roleId: userRole.id,
                            resellerId: resellerId
                        }
                    ]
                },
                {
                    include: [db.Relationship],
                    transaction: transaction
                }
            );
        } else {
            merchantEntity = await db.Merchant.create({
                clientId: null,
                name: name,
                country: country,
                canonicalResellerId: canonicalResellerId
            });
            //update baseAddressId
            let addressId = merchantEntity.baseAddressId;
            const addressDto = {
                addressLine1: extMidAddress
            };
            if (!addressId) {
                addressId = (await addressRepo.save(addressDto, transaction)).id;
            } else {
                await addressRepo.update(addressId, addressDto, transaction);
            }
            await merchantRepo.update(
                merchantEntity.id,
                {
                    baseAddressId: addressId
                },
                transaction
            );
            // paymentConfiguration
            const paymentsConfigurationDto = {
                merchantId: merchantEntity.id,
                acquirerBank: extConfigDetails.acquirerBank,
                mid: extConfigDetails.merchantId
            };
            await paymentsConfigurationRepo.save(paymentsConfigurationDto, transaction);
        }

        await transaction.commit();

        if (refferalDataValue) {
            //assuming t2s send extra data in referral link
            await refferalDataService.captureRefferalData(merchantEntity.id, refferalDataValue);
        }

        try {
            if (thirdPartyCustomerId) {
                await emailNotifyNewMerchantService.send(
                    merchantEntity.id,
                    merchantEntity.thirdPartyCustomer,
                    resellerId
                );
            }
        } catch (err) {
            console.log(err);
            console.log('Error sending message to Admin on new merchant creation with link');
        }
        const payLoad = JSON.stringify({
            merchant_id: merchantEntity?.id?.toString(),
            accountStatus: 'Pending',
            payoutStatus: 'BLOCKED',
            provider: 'Datman',
            storeId: merchantEntity.thirdPartyCustomer?.toString()
        });
        await foodHubWebHook(payLoad);

        return response({ id: merchantEntity.id }, 201);
    } catch (err) {
        console.error(err);
        if (transaction) {
            await transaction.rollback();
        }
        return response({}, 500);
    }
};
