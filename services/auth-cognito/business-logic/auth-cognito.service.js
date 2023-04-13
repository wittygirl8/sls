import {
    UserRepo,
    IdentityProviderMypayRelationsRepo,
    MerchantRepo,
    //UserRoleRepo,
    ResellerRepo
} from '../../../libs/repo';

var { sendEmail, signupConfirmationEmail } = process.env.IS_OFFLINE
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

const userRepo = new UserRepo(db);
const identityProviderMypayRelationsRepo = new IdentityProviderMypayRelationsRepo(db);
const merchantRepo = new MerchantRepo(db);
//const userRoleRepo = new UserRoleRepo(db);
const resellerRepo = new ResellerRepo(db);
const { v4: uuidv4 } = require('uuid');

const { Op } = db.Sequelize;

export class AuthCognitoService {
    /**
     * 
     * @param {string} cognitoId
     * @param {
      {
        email_verified: boolean,
        'cognito:email_alias': string,
        'cognito:phone_number_alias': string,
        given_name: string,
        family_name: string,
        email: string,
        picture: string
      }
    } userData 
     */
    async connectSocialAccountWithMyPayUser(cognitoId, userData, providerName) {
        const transaction = await db.sequelize.transaction();

        try {
            let user = await userRepo.findOne({
                where: {
                    email: userData.email
                }
            });
            if (user) {
                const identityRelationsDto = {
                    userId: user.id,
                    providerId: cognitoId,
                    providerName: providerName,
                    isActive: true
                };
                await identityProviderMypayRelationsRepo.save(identityRelationsDto, transaction);
            }
            if (!user) {
                const userType = await db.UserType.findOne({
                    where: {
                        name: 'Merchant'
                    }
                });

                await db.IdentityProviderMyPayRelations.create(
                    {
                        providerId: cognitoId,
                        providerName: providerName,
                        isActive: true,
                        User: {
                            firstName: userData.given_name,
                            lastName: userData.family_name,
                            email: userData.email,
                            pictureUrl: userData.picture,
                            typeId: userType.id,
                            phoneNumber: userData.phone_number,
                            emailConfirmationToken: uuidv4(),
                            signupStatus: 1
                        }
                    },
                    {
                        include: [db.User],
                        transaction: transaction
                    }
                );

                ///Implemented by AM-2497 US, maybe we will need this code in the future.

                // var userRole = await userRoleRepo.findOne({
                //     where: {
                //         name: 'Owner'
                //     }
                // });

                // const resellers = await resellerRepo.findAll();

                // const promises = resellers.map(async (resellerObj) => {
                //     await db.Merchant.create(
                //         {
                //             name: 'Test Merchant',
                //             Relationships: [
                //                 {
                //                     userId: idRelation.User.id,
                //                     roleId: userRole.id,
                //                     resellerId: resellerObj.id
                //                 }
                //             ]
                //         },
                //         {
                //             include: [db.Relationship],
                //             transaction: transaction
                //         }
                //     );
                // });

                // await Promise.all(promises);
            }

            await transaction.commit();
        } catch (err) {
            if (transaction) {
                await transaction.rollback();
            }
            console.error(err);
            throw err;
        }
    }
    async sendEmailConfirmationMessage(email, resellerPortalUrl) {
        const url = process.env.EMAIL_CONFIRMATION_HANDLER;
        const user = await userRepo.findOne({ where: { email: email } });
        const token = user.emailConfirmationToken;
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

        const emailTemplate = signupConfirmationEmail({
            url,
            token,
            resellerBrandingObject: resellerBrandingObj
        });
        await sendEmail({
            email: email,
            subject: 'Please confirm your email',
            message: emailTemplate,
            resellerBrandingObj
        });
    }

    async addClaims(amazonIdentifier, useFederatedIdentities) {
        const userProvider = await identityProviderMypayRelationsRepo.findOne({
            where: {
                providerId: amazonIdentifier
            }
        });

        if (useFederatedIdentities && !userProvider) {
            return null;
        }

        const merchants = await merchantRepo.findAllOnlyId({
            where: {
                clientId: { [Op.eq]: null }
            },
            include: [
                {
                    model: db.Relationship,
                    attributes: [],
                    where: {
                        userId: userProvider.userId
                    }
                }
            ]
        });

        const user = await userRepo.findByPk(userProvider.userId, {
            include: db.UserType
        });

        const arrayOfMerchants = merchants.map((merchant) => merchant.id);

        return { myPayUserId: userProvider.userId, merchants: arrayOfMerchants, user };
    }
}
