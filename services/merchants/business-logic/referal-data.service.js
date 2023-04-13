var {
    RefferalDataRepo,
    OwnersDetailsRepo,
    AddressRepo,
    MerchantRepo,
    BusinessDetailRepo
} = require('../../../libs/repo');
var atob = require('atob');
var phpSerialize = require('php-serialize');

var { countryCodeFromName } = process.env.IS_OFFLINE
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

const refferalDataRepo = new RefferalDataRepo(db);
const ownersDetailsRepo = new OwnersDetailsRepo(db);
const addressRepo = new AddressRepo(db);
const merchantRepo = new MerchantRepo(db);
const businessDetailRepo = new BusinessDetailRepo(db);

export class RefferalDataService {
    /**
     *
     * @param {string} userId
     * @param {string} refferalDataValue
     */
    isRefferalKeyAlradyExist(userId, refferalDataValue) {
        const referral = refferalDataRepo.findOne({
            where: {
                userId,
                refferalData: refferalDataValue
            }
        });

        return referral ? true : false;
    }

    //assuming t2s send extra data in referral link
    async captureRefferalData(merchantId, refferalDataValue) {
        function fixReferralLinkPayload(payload) {
            if (payload) {
                if (payload.OwnerEmail) {
                    payload.OwnerEmail = payload.OwnerEmail.toLowerCase().replace(/ /g, '');
                }
            }
            return payload;
        }

        const { sequelize } = db;
        let transaction = await sequelize.transaction();
        let transaction2 = await sequelize.transaction();
        try {
            let refferalData;
            try {
                refferalData = JSON.parse(atob(refferalDataValue));
            } catch (ex) {
                refferalData = phpSerialize.unserialize(atob(refferalDataValue));
            }
            refferalData = fixReferralLinkPayload(refferalData);

            const businessPhoneNumber =
                refferalData.BusinessPhoneNumber &&
                countryCodeFromName[refferalData.BusinessAddressCountry] +
                    Number(refferalData.BusinessPhoneNumber).toString();

            const ownerPhoneNumber =
                refferalData.BusinessPhoneNumber &&
                countryCodeFromName[refferalData.BusinessAddressCountry] +
                    Number(refferalData.OwnerPhoneNumber).toString();

            const businessDetailDto = {
                tradingName: refferalData.TradingName,
                phoneNumber: businessPhoneNumber,
                websiteUrl: refferalData.MerchantURL,
                email: refferalData.MerchantEmail
            };
            const businessDetailId = (await businessDetailRepo.save(businessDetailDto, transaction)).id;

            const ownerAddressDto = {
                phoneNumber: ownerPhoneNumber,
                city: refferalData.OwnerAddressCity,
                country: refferalData.OwnerAddressCountry,
                postCode: refferalData.OwnerAddressPostcode,
                addressLine1: refferalData.OwnerAddress1,
                addressLine2: refferalData.OwnerAddress2
            };
            const primaryOwnerAddressId = (await addressRepo.save(ownerAddressDto, transaction)).id;

            const tradingAddressDto = {
                phoneNumber: businessPhoneNumber,
                city: refferalData.BusinessAddressCity,
                country: refferalData.BusinessAddressCountry,
                postCode: refferalData.BusinessAddressPostcode,
                addressLine1: refferalData.BusinessAddress1,
                addressLine2: refferalData.BusinessAddress2
            };
            const tradingAddressId = (await addressRepo.save(tradingAddressDto, transaction)).id;

            const primaryOwnerDto = {
                fullName: refferalData.OwnerName
                    ? refferalData.OwnerName
                    : ((refferalData.OwnerFirstName || '') + ' ' + (refferalData.OwnerLastName || '')).trim(),
                email: refferalData.OwnerEmail,
                contactPhone: ownerPhoneNumber,
                ownerAddressId: primaryOwnerAddressId
            };
            const primaryOwnerId = (await ownersDetailsRepo.save(primaryOwnerDto, transaction)).id;

            await transaction.commit();

            //assuming t2s send eat appy clients ClientType='EAT-APPY' which we capture as merchant.signupLinkFrom
            await merchantRepo.update(
                merchantId,
                {
                    primaryOwnerId: primaryOwnerId,
                    legalName: refferalData.TradingName,
                    tradingAddressId: tradingAddressId,
                    businessDetailId: businessDetailId,
                    signupLinkFrom: refferalData.ClientType,
                    merchantType: refferalData.MerchantType,
                    providers: JSON.stringify(refferalData.providers)
                },
                transaction2
            );
            await transaction2.commit();
        } catch (err) {
            console.log('Error in captureRefferalData::', err);
            if (transaction) {
                await transaction.rollback();
            }
        }
    }

    async getReferralDataString(userId) {
        try {
            const referralData = await refferalDataRepo.findOne({
                where: { userId: userId },
                attributes: ['referral_data']
            });

            const referralString = referralData ? referralData.dataValues : null;
            return referralString;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}
