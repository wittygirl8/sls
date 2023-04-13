'use strict';
require('dotenv').config();
global.fetch = require('node-fetch').default;
var AWS = require('aws-sdk');
AWS.config.setPromisesDependency(require('bluebird'));
var CognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
    apiVersion: '2019-11-07',
    region: process.env.AWS_REGION
});

const { CognitoUserPool, CognitoUser, AuthenticationDetails } = require('amazon-cognito-identity-js');
var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

const poolData = {
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    ClientId: process.env.COGNITO_CLIENT_ID
};
const userPool = new CognitoUserPool(poolData);

const { v4: uuidv4 } = require('uuid');

export const completeInvite = async (event) => {
    let transaction;
    let transactionRds;
    let changePasswordCognitoResult;
    let authenticationDetails;
    let body;

    if (!event.body) {
        return response({}, 400);
    }
    body = JSON.parse(event.body);

    authenticationDetails = new AuthenticationDetails({
        Username: body.username,
        Password: body.oldPassword
    });

    const userData = {
        Username: body.username,
        Pool: userPool
    };

    try {
        const oldUser = await db.User.findOne({
            where: {
                email: body.email
            }
        });

        if (!oldUser) {
            return response({}, 404);
        }

        transaction = await db.sequelize.transaction();

        //Update user
        await oldUser.update(
            {
                firstName: body.firstName,
                lastName: body.lastName,
                phoneNumber: body.phone,
                emailConfirmationToken: uuidv4(),
                signupStatus: 1
            },
            { transaction: transaction }
        );

        changePasswordCognitoResult = await changePassword(
            userData,
            authenticationDetails,
            body.oldPassword,
            body.password
        );

        await transaction.commit();

        const identityProviderMypayRelation = await db.IdentityProviderMyPayRelations.findOne({
            where: { userId: oldUser.id }
        });

        const username = identityProviderMypayRelation.providerId;

        let params = {
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            Username: username,
            UserAttributes: [
                {
                    Name: 'given_name',
                    Value: body.firstName
                },
                {
                    Name: 'family_name',
                    Value: body.lastName
                },
                {
                    Name: 'phone_number',
                    Value: body.phone
                }
            ]
        };
        await CognitoIdentityServiceProvider.adminUpdateUserAttributes(params).promise();

        if (process.env.IS_OFFLINE) {
            const dbCognito = connectDB(
                process.env.DB_RESOURCE_ARN,
                process.env.INFRA_STAGE + '_database',
                '',
                process.env.SECRET_ARN,
                false
            );
            const oldUserRds = await dbCognito.User.findOne({
                where: {
                    email: body.email
                }
            });

            if (oldUserRds) {
                transactionRds = await dbCognito.sequelize.transaction();
                //Update user
                await oldUserRds.update(
                    {
                        firstName: body.firstName,
                        lastName: body.lastName,
                        phoneNumber: body.phone,
                        emailConfirmationToken: uuidv4(),
                        signupStatus: 1
                    },
                    { transaction: transactionRds }
                );

                await transactionRds.commit();
            }
        }

        return response(changePasswordCognitoResult, 200);
    } catch (error) {
        console.error(error);
        if (transaction) {
            await transaction.rollback();
        }
        if (transactionRds) {
            await transactionRds.rollback();
        }
        if (changePasswordCognitoResult && changePasswordCognitoResult.statusCode === 200) {
            authenticationDetails = new AuthenticationDetails({
                Username: body.username,
                Password: body.password
            });
            await changePassword(userData, authenticationDetails, body.password, body.oldPassword);
        }
        return response({}, 500);
    }
};

const changePassword = (userData, authenticationDetails, oldPassword, newPassword) => {
    return new Promise((resolve, reject) => {
        const cognitoUser = new CognitoUser(userData);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: () => {
                cognitoUser.changePassword(oldPassword, newPassword, (err, result) => {
                    if (err) {
                        reject(err);
                    } else if (result) {
                        resolve(response({}));
                    }
                });
            },
            newPasswordRequired: (userAttributes) => {
                delete userAttributes.email_verified;
                delete userAttributes.phone_number_verified;

                userAttributes.name = authenticationDetails.username;
                cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, {
                    onSuccess: () => {
                        resolve(response({}));
                    },
                    onFailure: (err) => {
                        reject(err);
                    }
                });
            },
            onFailure: function (err) {
                reject(err);
            }
        });
    });
};
