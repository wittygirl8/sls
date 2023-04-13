var { MerchantRepo } = require('../../../libs/repo/merchant.repo');
var { ResellerRepo } = require('../../../libs/repo/reseller.repo');
var { RelationshipRepo } = require('../../../libs/repo/relationship.repo');
var { UserRepo } = require('../../../libs/repo/user.repo');
var { UserRoleRepo } = require('../../../libs/repo/user-role.repo');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
var {
    createUserWithTemporaryPassword,
    sendEmail,
    getInviteNewUserEmail,
    getInviteExistingUserEmail,
    getUserDetails,
    models
} = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');

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

const merchantRepo = new MerchantRepo(db);
const relationshipRepo = new RelationshipRepo(db);
const userRepo = new UserRepo(db);
const userRoleRepo = new UserRoleRepo(db);
const resellerRepo = new ResellerRepo(db);
const { UserType } = models;

export class TeamService {
    async InviteMembers(event) {
        let transaction;
        try {
            const { sequelize } = db;
            const body = JSON.parse(event.body);
            const emailsAndRoles = body.emailsAndRoles;
            const merchantId = body.merchantId;
            const useDetails = await getUserDetails(event);
            const invitedBy = await getUserById(useDetails.userId);
            const invitedUserType = useDetails.userType;
            const resellerId = body.resellerId;
            let inviterRelationship;
            let inviterReseller;

            if (invitedUserType === UserType.ADMIN || invitedUserType === UserType.SUPER_ADMIN) {
                inviterReseller = await resellerRepo.findOne({
                    where: {
                        id: resellerId
                    }
                });
            } else {
                inviterRelationship = await relationshipRepo.findOne({
                    where: {
                        userId: invitedBy.id,
                        merchantId: merchantId
                    }
                });

                inviterReseller = await resellerRepo.findOne({
                    where: {
                        id: inviterRelationship.resellerId
                    }
                });
            }

            let portalLink = process.env.WEB_CLIENT_URL;
            if (process.env.CUSTOM_DOMAINS) {
                for (let domain of process.env.CUSTOM_DOMAINS.split(',')) {
                    if (domain.includes(inviterReseller.portalURL)) {
                        portalLink = domain;
                        break;
                    }
                }
            }
            let locationStartPath = process.env.CUSTOM_DOMAINS
                ? portalLink
                : `${portalLink}/${encodeURIComponent(inviterReseller.portalURL)}`;

            const resellerBrandingObj = {
                resellerLogo: inviterReseller.logo,
                resellerContactUsPage: inviterReseller.contactUsPageURL,
                portalURL: inviterReseller.portalURL,
                resellerName: inviterReseller.name,
                email: inviterReseller.suportEmail,
                termAndCondPageUrl: inviterReseller.termAndCondPageUrl,
                supportTelNo: inviterReseller.supportTelNo,
                brandingURL: inviterReseller.brandingURL,
                senderEmail: inviterReseller.senderEmail,
                website: inviterReseller.website,
                address: inviterReseller.address
            };

            for (const emailAndRole of emailsAndRoles) {
                const user = await getUser(emailAndRole.email);
                const userRole = await userRoleRepo.findOne({
                    where: {
                        name: emailAndRole.role
                    }
                });

                const merchant = await merchantRepo.findOne({
                    where: {
                        id: merchantId
                    }
                });

                transaction = await sequelize.transaction();
                if (user) {
                    const userType = await db.UserType.findByPk(user.typeId);

                    if (userType.name !== 'Admin') {
                        const existingRelationship = await relationshipRepo.findOne({
                            where: {
                                userId: user.id,
                                merchantId: merchantId
                            }
                        });

                        if (!existingRelationship) {
                            await createUserRelationship(
                                user.id,
                                merchantId,
                                userRole.id,
                                transaction,
                                inviterReseller.id
                            );
                        }
                        if (!user.signupStatus) {
                            const newPasswordResult = await setPasswordForCognitoUser(emailAndRole.email);

                            const changePasswordLink = `${locationStartPath}/signup?email=${encodeURIComponent(
                                emailAndRole.email
                            )}&oldPassword=${encodeURIComponent(newPasswordResult.password)}`;

                            let emailText = getInviteNewUserEmail(resellerBrandingObj);

                            const subject = 'You have been assigned to new Merchant';

                            emailText = emailText.replace(new RegExp('##business_name##', 'g'), merchant.name);
                            emailText = emailText.replace(new RegExp('##email_address##', 'g'), invitedBy.email);
                            emailText = emailText.replace(
                                new RegExp('##user_email_address##', 'g'),
                                emailAndRole.email
                            );
                            emailText = emailText.replace(
                                new RegExp('##change_password_link##', 'g'),
                                changePasswordLink
                            );

                            await sendEmail({
                                email: emailAndRole.email,
                                subject: subject,
                                message: emailText,
                                resellerBrandingObj
                            });
                        } else {
                            const subject = 'You have been assigned to new Merchant';
                            let emailText = getInviteExistingUserEmail(resellerBrandingObj);
                            emailText = emailText.replace(new RegExp('##business_name##', 'g'), merchant.name);
                            emailText = emailText.replace(new RegExp('##email_address##', 'g'), invitedBy.email);
                            emailText = emailText.replace(new RegExp('##portal_link##', 'g'), locationStartPath);
                            await sendEmail({
                                email: emailAndRole.email,
                                subject: subject,
                                message: emailText,
                                resellerBrandingObj
                            });
                        }
                        await userRepo.update(user, { resentInviteAt: new Date() }, transaction);
                    }
                } else {
                    body.email = emailAndRole.email;
                    body.verifyEmail = true;
                    event.body = JSON.stringify(body);

                    const password = await createUserWithTemporaryPassword(
                        event,
                        db,
                        connectDB,
                        true,
                        resellerBrandingObj.portalURL
                    );

                    let emailText = getInviteNewUserEmail(resellerBrandingObj);

                    const subject = 'You have been assigned to new Merchant';
                    const changePasswordLink = `${locationStartPath}/signup?email=${encodeURIComponent(
                        emailAndRole.email
                    )}&oldPassword=${encodeURIComponent(password)}`;
                    emailText = emailText.replace(new RegExp('##business_name##', 'g'), merchant.name);
                    emailText = emailText.replace(new RegExp('##email_address##', 'g'), invitedBy.email);
                    emailText = emailText.replace(new RegExp('##user_email_address##', 'g'), emailAndRole.email);
                    emailText = emailText.replace(new RegExp('##change_password_link##', 'g'), changePasswordLink);

                    const newUser = await getUser(emailAndRole.email);
                    await createUserRelationship(newUser.id, merchantId, userRole.id, transaction, inviterReseller.id);
                    await sendEmail({
                        email: emailAndRole.email,
                        subject: subject,
                        message: emailText,
                        resellerBrandingObj
                    });
                }
                await transaction.commit();
            }
        } catch (error) {
            console.error(error);
            if (transaction) {
                await transaction.rollback();
            }

            throw error;
        }
    }
}

async function getUser(email) {
    const user = await userRepo.findOne({
        where: {
            email: email
        }
    });
    return user;
}

async function getUserById(id) {
    const user = await userRepo.findOne({
        where: {
            id: id
        }
    });
    return user;
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

const setPasswordForCognitoUser = async (email, isTemporary) => {
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
};
