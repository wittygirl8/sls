'use strict';
require('dotenv').config();
global.fetch = require('node-fetch').default;

var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
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

export const toggleDisableEnable = async (event) => {
    try {
        const email = event.pathParameters.email;
        const body = JSON.parse(event.body);
        const isDisable = body.isDisable;

        const resultListUsers = await listUsersByEmailInCongnito({
            AttributesToGet: [ "email" ],
            Filter: "email = \"" + email + "\"",
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
        });

        if(!resultListUsers.isSuccesfully) {
            const error = resultListUsers.err;
            return response({ error }, 500);
        }

        let result = null;
        let ok = true;
        let error = null;
        if (isDisable) {
            resultListUsers.data.Users.map(async user => {
                if(ok) {
                    result = await enableUserInCognito({
                        Username: user.Username,
                        UserPoolId: process.env.COGNITO_USER_POOL_ID,
                    });
                    if(!result.isSuccesfully) {
                        ok = false;
                        error = result.err;
                    }
                }
            })
        } else {
            resultListUsers.data.Users.map(async user => {
                if(ok) {
                    result = await disableUserInCognito({
                        Username: user.Username,
                        UserPoolId: process.env.COGNITO_USER_POOL_ID,
                    });
                    if(!result.isSuccesfully) {
                        ok = false;
                        error = result.err;
                    }
                }
            })
        }

        if (ok) {
            await disableEnableUserInDb(email, isDisable);
            return response({ email });
        } else {
            return response({ error }, 404);
        }
    } catch (error) {
        return response({ error }, 500);
    }
};

const listUsersByEmailInCongnito = (params) => {
    return new Promise((resolve) => {
        cognitoServiceProvider.listUsers(params, function (err, data) {
            if (err) {
                resolve({
                    isSuccesfully: false,
                    err,
                });
            } else {
                resolve({
                    isSuccesfully: true,
                    data,
                });
            }
        });
    });
};

const enableUserInCognito = (params) => {
    return new Promise((resolve) => {
        cognitoServiceProvider.adminEnableUser(params, function (err, data) {
            if (err) {
                resolve({
                    isSuccesfully: false,
                    err,
                });
            } else {
                resolve({
                    isSuccesfully: true,
                    data,
                });
            }
        });
    });
};

const disableUserInCognito = (params) => {
    return new Promise((resolve) => {
        cognitoServiceProvider.adminDisableUser(params, function (err, data) {
            if (err) {
                resolve({
                    isSuccesfully: false,
                    err,
                });
            } else {
                resolve({
                    isSuccesfully: true,
                    data,
                });
            }
        });
    });
};

const disableEnableUserInDb = async (email, isDisable) => {
    const { User } = db;
    await User.update(
        { isDisable: !isDisable },
        {
            where: {
                email: email,
            },
        }
    );
};
