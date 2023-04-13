var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
var { getUserId, sendEmail, createUserWithTemporaryPassword, models } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
const {
    RelationshipRepo,
    UserCanonicalResellerMapRepo,
    CanonicalResellerRepo,
    ResellerRepo,
    UserRepo,
    UserRoleRepo
} = require('../../../libs/repo');
const { UserTeamRepo } = require('../../../libs/repo/user-team.repo');
import { SuccessOperation } from './service.response.helper';
import { addNewUserAsCanonicalResellerMemberTemplate } from '../email-templates/add-new-user-as-canonical-reseller-member';
import { addExistingUserAsCanonicalResellerMemberTemplate } from '../email-templates/add-existing-user-as-canonical-reseller-member';
const { UserRole } = models;

const AWS = require('aws-sdk');
const cognitoServiceProvider = new AWS.CognitoIdentityServiceProvider();
const generatePassword = require('password-generator');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

const relationshipRepo = new RelationshipRepo(db);
const userTeamRepo = new UserTeamRepo(db);
const userRepo = new UserRepo(db);
const userRoleRepo = new UserRoleRepo(db);
const userCanonicalResellerMapRepo = new UserCanonicalResellerMapRepo(db);
const canonicalResellerRepo = new CanonicalResellerRepo(db);
const resellerRepo = new ResellerRepo(db);

export class TeamService {
    async getRelationshipsByMerchantId(merchantId) {
        return await relationshipRepo.findAll({
            where: { merchantId: merchantId }
        });
    }

    async getRelationshipsByCanonicalResellerId(canonicalResellerId) {
        return await userCanonicalResellerMapRepo.findAll({
            where: { canonicalResellerId: canonicalResellerId }
        });
    }

    async getUsersByIds(usersIds, merchantId) {
        return await userTeamRepo.findAll({
            where: {
                id: usersIds
            },
            whereMerchantId: {
                merchant_id: merchantId
            },
            order: [['signupStatus', 'DESC']]
        });
    }
    async deleteRelationship(relationshipId, canonicalResellerId = null) {
        let transaction;

        try {
            transaction = await db.sequelize.transaction();

            let relationship = await relationshipRepo.findByPk(relationshipId);
            let result;

            if (canonicalResellerId) {
                //Belongs to a canonical reseller, just delete the user canonical reseller mapping
                result = await userCanonicalResellerMapRepo.delete(
                    relationship.userId,
                    canonicalResellerId,
                    transaction
                );
            } else {
                //Belongs to a merchant, delete the relationship
                result = await relationshipRepo.delete(relationshipId, transaction);
            }

            await transaction.commit();

            return SuccessOperation(result);
        } catch (err) {
            await transaction.rollback();

            throw err;
        }
    }

    async inviteCanonicalResellerMembers(event) {
        let transaction;
        try {
            const { sequelize } = db;
            const body = JSON.parse(event.body);
            const emailsAndRoles = body.emailsAndRoles;
            const canonicalResellerId = body.canonicalResellerId;
            const userId = await getUserId(event);

            const invitedBy = await getUserById(userId);

            const inviterCanonicalRelationship = await userCanonicalResellerMapRepo.findOne({
                where: {
                    userId: invitedBy.id,
                    canonicalResellerId: canonicalResellerId
                }
            });

            const inviterReseller = await resellerRepo.findOne({
                where: {
                    id: inviterCanonicalRelationship.resellerId
                }
            });

            const inviterCanonicalReseller = await canonicalResellerRepo.findOne({
                where: {
                    id: canonicalResellerId
                }
            });

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
                const isAgent = emailAndRole.role === UserRole.AGENT;
                transaction = await sequelize.transaction();
                if (user) {
                    const userType = await db.UserType.findByPk(user.typeId);

                    if (userType.name !== 'Admin') {
                        const existingRelationship = await relationshipRepo.findOne({
                            where: {
                                userId: user.id,
                                resellerId: inviterReseller.id,
                                merchantId: null
                            }
                        });

                        if (!existingRelationship) {
                            await createUserRelationship(user.id, null, userRole.id, transaction, inviterReseller.id);
                        }

                        await userCanonicalResellerMapRepo.save(
                            {
                                userId: user.id,
                                canonicalResellerId: canonicalResellerId,
                                resellerId: inviterReseller.id
                            },
                            transaction
                        );

                        if (!user.signupStatus) {
                            const newPasswordResult = await setPasswordForCognitoUser(emailAndRole.email);

                            const changePasswordLink = `${locationStartPath}/signup?email=${encodeURIComponent(
                                emailAndRole.email
                            )}&oldPassword=${encodeURIComponent(newPasswordResult.password)}`;

                            let emailText = addNewUserAsCanonicalResellerMemberTemplate(resellerBrandingObj, {
                                changePasswordLink,
                                userEmailAddress: emailAndRole.email,
                                invitedByEmail: invitedBy.email,
                                canonicalResellerName: inviterCanonicalReseller.companyName,
                                canonicalResellerOwnerEmail: inviterCanonicalReseller.primaryContactEmail,
                                userRole: emailAndRole.role,
                                isAgent: isAgent
                            });

                            const subject = 'You have been assigned to new Reseller';
                            await sendEmail({
                                email: emailAndRole.email,
                                subject: subject,
                                message: emailText,
                                resellerBrandingObj
                            });
                        } else {
                            const subject = 'You have been assigned to a new Reseller';
                            let emailText = addExistingUserAsCanonicalResellerMemberTemplate(resellerBrandingObj, {
                                userEmailAddress: emailAndRole.email,
                                invitedByEmail: invitedBy.email,
                                canonicalResellerName: inviterCanonicalReseller.companyName,
                                canonicalResellerOwnerEmail: inviterCanonicalReseller.primaryContactEmail,
                                isAgent: isAgent
                            });
                            await sendEmail({
                                email: emailAndRole.email,
                                subject: subject,
                                message: emailText,
                                resellerBrandingObj
                            });
                        }
                    }
                    await userRepo.update(user, { resentInviteAt: new Date() }, transaction);
                } else {
                    const password = await createUserWithTemporaryPassword(
                        {
                            body: JSON.stringify({
                                email: emailAndRole.email,
                                isCanonicalResellerMemberInvite: true,
                                verifyEmail: true
                            })
                        },
                        db,
                        connectDB,
                        true,
                        resellerBrandingObj.portalURL
                    );

                    const newUser = await getUser(emailAndRole.email);

                    await createUserRelationship(newUser.id, null, userRole.id, transaction, inviterReseller.id);

                    await userCanonicalResellerMapRepo.save(
                        {
                            userId: newUser.id,
                            canonicalResellerId: canonicalResellerId,
                            resellerId: inviterReseller.id
                        },
                        transaction
                    );

                    const changePasswordLink = `${locationStartPath}/signup?email=${encodeURIComponent(
                        emailAndRole.email
                    )}&oldPassword=${encodeURIComponent(password)}`;

                    let emailText = addNewUserAsCanonicalResellerMemberTemplate(resellerBrandingObj, {
                        changePasswordLink,
                        userEmailAddress: emailAndRole.email,
                        invitedByEmail: invitedBy.email,
                        canonicalResellerName: inviterCanonicalReseller.companyName,
                        canonicalResellerOwnerEmail: inviterCanonicalReseller.primaryContactEmail,
                        isAgent: isAgent
                    });

                    const subject = 'You have been assigned to new Reseller';
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
