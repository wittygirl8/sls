const { response } = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');

const AWS = require('aws-sdk');
const cognitoServiceProvider = new AWS.CognitoIdentityServiceProvider();
export const handler = async (event) => {
    try {
        await deleteUserFromCognito({
            Username: event.pathParameters.sub,
            UserPoolId: process.env.COGNITO_USER_POOL_ID
        });
        return response({});
    } catch (err) {
        console.error(err);
        return response({}, 500);
    }
};

const deleteUserFromCognito = (params) => {
    return new Promise((resolve, reject) => {
        cognitoServiceProvider.adminDeleteUser(params, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve({
                    data
                });
            }
        });
    });
};
