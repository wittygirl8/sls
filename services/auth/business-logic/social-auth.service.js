import {
    UserRepo,
    IdentityProviderMypayRelationsRepo,
    MerchantRepo,
    UserRoleRepo,
    RelationshipRepo,
    ResellerRepo,
    UserTypeRepo
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
const { v4: uuidv4 } = require('uuid');

const userRepo = new UserRepo(db);
const identityProviderMypayRelationsRepo = new IdentityProviderMypayRelationsRepo(db);
const merchantRepo = new MerchantRepo(db);
const userRoleRepo = new UserRoleRepo(db);
const relationshipRepo = new RelationshipRepo(db);
const resellerRepo = new ResellerRepo(db);
const userTypeRepo = new UserTypeRepo(db);

export class SocialAuthService {
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

    async createUserForSocialFlow(cognitoId, userData, refreshToken) {
        let transaction;
        let transactionRds;
        const providerName = 'Cognito';

        try {
            if (process.env.IS_OFFLINE) {
                const dbCognito = connectDB(
                    process.env.DB_RESOURCE_ARN,
                    process.env.INFRA_STAGE + '_database',
                    '',
                    process.env.SECRET_ARN,
                    false
                );

                transactionRds = await dbCognito.sequelize.transaction();

                const userRepoRds = new UserRepo(dbCognito);
                const identityProviderMypayRelationsRepoRds = new IdentityProviderMypayRelationsRepo(dbCognito);
                const merchantRepoRds = new MerchantRepo(dbCognito);
                const userRoleRepoRds = new UserRoleRepo(dbCognito);
                const relationshipRepoRds = new RelationshipRepo(dbCognito);
                const resellerRepoRds = new ResellerRepo(dbCognito);
                const userTypeRepoRds = new UserTypeRepo(dbCognito);

                const repoData = {
                    transaction: transactionRds,
                    userRepo: userRepoRds,
                    userRoleRepo: userRoleRepoRds,
                    resellerRepo: resellerRepoRds,
                    merchantRepo: merchantRepoRds,
                    identityProviderMypayRelationsRepo: identityProviderMypayRelationsRepoRds,
                    userTypeRepo: userTypeRepoRds,
                    relationshipRepo: relationshipRepoRds
                };

                const user = await this.createUserWithMerchant(
                    userData,
                    cognitoId,
                    providerName,
                    repoData,
                    refreshToken
                );
                transactionRds = null;

                transaction = await db.sequelize.transaction();

                const repoDataLocal = {
                    transaction,
                    userRepo,
                    userRoleRepo,
                    resellerRepo,
                    merchantRepo,
                    identityProviderMypayRelationsRepo,
                    userTypeRepo,
                    relationshipRepo
                };
                const userLocal = await this.createUserWithMerchant(
                    userData,
                    cognitoId,
                    providerName,
                    repoDataLocal,
                    refreshToken,
                    user.id
                );
                return userLocal;
            } else {
                transaction = await db.sequelize.transaction();
                const repoData = {
                    transaction,
                    userRepo,
                    userRoleRepo,
                    resellerRepo,
                    merchantRepo,
                    identityProviderMypayRelationsRepo,
                    userTypeRepo,
                    relationshipRepo
                };
                return await this.createUserWithMerchant(userData, cognitoId, providerName, repoData, refreshToken);
            }
        } catch (err) {
            if (transaction) {
                await transaction.rollback();
            }
            if (transactionRds) {
                await transactionRds.rollback();
            }
            console.error(err);
            throw err;
        }
    }

    async createUserWithMerchant(userData, cognitoId, providerName, repoData, refreshToken, useExistingUserId) {
        const {
            transaction,
            userRepo,
            userRoleRepo,
            resellerRepo,
            merchantRepo,
            identityProviderMypayRelationsRepo,
            userTypeRepo,
            relationshipRepo
        } = repoData;
        let user;
        if (useExistingUserId) {
            user = await userRepo.findOne({
                where: {
                    id: useExistingUserId
                }
            });
        } else {
            user = await userRepo.findOne({
                where: {
                    email: userData.email
                }
            });
        }
        if (!user) {
            const userType = await userTypeRepo.findOne({
                where: {
                    name: 'Merchant'
                }
            });
            const userDto = {
                id: useExistingUserId ? useExistingUserId : null,
                firstName: userData.given_name,
                lastName: userData.family_name,
                email: userData.email,
                pictureUrl: userData.picture,
                typeId: userType.id,
                refreshToken: refreshToken,
                emailConfirmationToken: uuidv4(),
                signupStatus: 1
            };

            user = await userRepo.save(userDto);

            var userRole = await userRoleRepo.findOne({
                where: {
                    name: 'Owner'
                }
            });

            const resellers = await resellerRepo.findAll();

            const promises = resellers.map(async (resellerObj) => {
                const merchant = await merchantRepo.save(
                    {
                        name: 'Test Merchant'
                    },
                    transaction
                );
                await relationshipRepo.save(
                    {
                        userId: user.id,
                        merchantId: merchant.id,
                        roleId: userRole.id,
                        resellerId: resellerObj.id
                    },
                    transaction
                );
            });

            await Promise.all(promises);
        }

        const identityRelationsDto = {
            userId: user.id,
            providerId: cognitoId,
            providerName: providerName,
            isActive: true
        };
        await identityProviderMypayRelationsRepo.save(identityRelationsDto, transaction);
        await transaction.commit();

        return user;
    }
}
