import {
    UserRepo,
    UserRoleRepo,
    ResellerRepo,
    MerchantRepo,
    RelationshipRepo,
    IdentityProviderMypayRelationsRepo
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

const AWS = require('aws-sdk');
const cognitoServiceProvider = new AWS.CognitoIdentityServiceProvider();
const generatePassword = require('password-generator');
const { v4: uuidv4 } = require('uuid');

const userRepo = new UserRepo(db);
const userRoleRepo = new UserRoleRepo(db);
const resellerRepo = new ResellerRepo(db);
const merchantRepo = new MerchantRepo(db);
const relationshipRepo = new RelationshipRepo(db);
const identityProviderMypayRelationsRepo = new IdentityProviderMypayRelationsRepo(db);

export class AuthService {
    /**
     *
     * @param {string} userId
     * @param {string} refreshToken
     */
    async saveRefreshToken(userId, refreshToken) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
            await userRepo.updateById(
                userId,
                {
                    refreshToken: refreshToken
                },
                transaction
            );
            await transaction.commit();
        } catch (err) {
            console.error(err);
            if (transaction) {
                await transaction.rollback();
            }
            throw err;
        }
    }

    /**
     *
     * @param {string} userId
     */
    async getRefreshToken(userId) {
        try {
            const user = await userRepo.findByPk(userId);
            return {
                refreshToken: user.refreshToken
            };
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async deleteRefreshToken(userId) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
            await userRepo.removeRefreshToken(userId, transaction);
            await transaction.commit();
        } catch (err) {
            console.error(err);
            if (transaction) {
                await transaction.rollback();
            }
            throw err;
        }
    }

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
            if (!user) {
                const userType = await db.UserType.findOne({
                    where: {
                        name: 'Merchant'
                    }
                });
                const userDto = {
                    firstName: userData.given_name,
                    lastName: userData.family_name,
                    email: userData.email,
                    pictureUrl: userData.picture,
                    typeId: userType.id,
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
        console.log('token', token);

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

    async confirmUserEmail(email) {
        try {
            const user = await userRepo.findOne({
                where: {
                    email: email
                }
            });

            await userRepo.update(user, { isEmailConfirmed: true });
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
    async setPasswordForCognitoUser(email, isTemporary) {
        return new Promise((resolve) => {
            let response = {
                isPasswordSetSuccessfully: false,
                password: '',
                errorMessage: ''
            };

            const userPoolId = process.env.COGNITO_USER_POOL_ID;
            const password = generatePassword(12, false);

            cognitoServiceProvider.adminSetUserPassword(
                {
                    UserPoolId: userPoolId,
                    Username: email,
                    Password: password,
                    Permanent: !isTemporary
                },
                (err) => {
                    if (err) {
                        response.errorMessage = err.message;
                    } else {
                        response.isPasswordSetSuccessfully = true;
                        response.password = password;
                    }
                    resolve(response);
                }
            );
        });
    }
}
