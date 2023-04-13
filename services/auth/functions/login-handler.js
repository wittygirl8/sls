'use strict';
require('dotenv').config();
global.fetch = require('node-fetch').default;

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

export const login = async (event) => {
    try {
        const { User } = db;

        if (!event.body) {
            const result = response({}, 400);
            return result;
        }
        let body = JSON.parse(event.body);

        const authenticationDetails = new AuthenticationDetails({
            Username: body.username,
            Password: body.password
        });

        const userData = {
            Username: body.username,
            Pool: userPool
        };

        const result = await authenticateUser(userData, authenticationDetails);

        if (result.statusCode === 201) {
            const user = await User.findOne({
                attributes: [
                    'email',
                    'firstName',
                    'lastName',
                    'pictureUrl',
                    'type_id'
                ],
                include: {
                    model: db.UserType,
                    attributes: ['name']
                },
                where: {
                    email: body.username
                }
            });
            if (user) {
                return response({ user, token: result.token }, 200);
            } else {
                return response({ error: 'User not found' }, 400);
            }
        } else {
            return response(result.error, result.statusCode);
        }
    } catch (error) {
        console.error(error);
        const result = response(null, 500);
        return result;
    }
};

const authenticateUser = (userData, authenticationDetails) => {
    return new Promise((resolve) => {
        const cognitoUser = new CognitoUser(userData);

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                const successResponse = { token: result.getIdToken().getJwtToken(), statusCode: 201 };
                resolve(successResponse);
            },
            onFailure: function (err) {
                const failureResponse = { error: err, statusCode: 400 };
                resolve(failureResponse);
            },
            newPasswordRequired: () => {
                const newPasswordResponse = { error: 'Password must be changed', statusCode: 400 };
                resolve(newPasswordResponse);
            }
        });
    });
};
