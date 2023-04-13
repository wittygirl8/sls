'use strict';
require('dotenv').config();
global.fetch = require('node-fetch').default;

var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');

const { CognitoUserPool, CognitoUser, AuthenticationDetails } = require('amazon-cognito-identity-js');
const { AuthService } = require('../business-logic/auth.service');
let authService = new AuthService();
const poolData = {
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    ClientId: process.env.COGNITO_CLIENT_ID
};

const userPool = new CognitoUserPool(poolData);

export const changePassword = async (event, context, callback) => {
    if (!event.body) {
        const response = response({}, 400);
        return callback(null, response);
    }
    const body = JSON.parse(event.body);

    let passwordResult = await authService.setPasswordForCognitoUser(body.username);

    if (!passwordResult.isPasswordSetSuccessfully) {
        return response({ error: passwordResult.errorMessage }, 500);
    }
    const userData = {
        Username: body.username,
        Pool: userPool
    };
    const authenticationDetails = new AuthenticationDetails({
        Username: body.username,
        Password: passwordResult.password
    });

    // const cognitoUser = new CognitoUser(userData);

    const hellp = await changePasswordhandler(
        userData,
        authenticationDetails,
        passwordResult.password,
        body.newPassword
    );
    return response(hellp.body, hellp.statusCode);
};

const changePasswordhandler = (userData, authenticationDetails, oldPassword, newPassword) => {
    return new Promise((resolve, reject) => {
        const cognitoUser = new CognitoUser(userData);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: () => {
                cognitoUser.changePassword(oldPassword, newPassword, (err, result) => {
                    if (err) {
                        console.log('error1', err);
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
                        console.log('error', err);
                        reject(err);
                    }
                });
            },
            onFailure: function (err) {
                console.log('FailureError', err);
                reject(err);
            }
        });
    });
};
