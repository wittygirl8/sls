///TODO: deploy for testing (wiil update all this mthods after testing)
var AWS = require('aws-sdk');
const { AuthService } = require('../../business-logic/auth.service');
AWS.config.setPromisesDependency(require('bluebird'));
var CognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
    apiVersion: '2019-11-07',
    region: process.env.AWS_REGION
});
let authService = new AuthService();
var { UserRepo, IdentityProviderMypayRelationsRepo } = require('../../../../libs/repo');

var { connectDB } = process.env.IS_OFFLINE ? require('../../../../layers/models_lib/src') : require('models');
const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);
const userRepo = new UserRepo(db);
const identityProviderMypayRelationsRepo = new IdentityProviderMypayRelationsRepo(db);

exports.confirmEmail = async (event) => {
    const portalURL = event.queryStringParameters.portalURL;
    const token = event.queryStringParameters.token;

    let url = process.env.WEB_CLIENT_URL;
    if (process.env.CUSTOM_DOMAINS) {
        for (let domain of process.env.CUSTOM_DOMAINS.split(',')) {
            if (domain.includes(portalURL)) {
                url = domain;
                break;
            }
        }
    }
    let locationStartPath = process.env.CUSTOM_DOMAINS ? url : `${url}/${encodeURIComponent(portalURL)}`;

    const user = await userRepo.findOne({ where: { emailConfirmationToken: token } });
    if (!user) {
        const errorMessage = 'Link is invalid or expired';
        console.error(errorMessage);
        const location = `${locationStartPath}/login#email_verification=failed&errorMessage=${encodeURIComponent(
            errorMessage
        )}`;
        return {
            statusCode: 301,
            headers: {
                Location: location
            },
            body: ''
        };
    }
    const identityProviderMypayRelation = await identityProviderMypayRelationsRepo.findOne({
        where: { userId: user.id }
    });

    const username = identityProviderMypayRelation.providerId;
    const email = user.email;

    let params = {
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: username,
        UserAttributes: [
            {
                Name: 'email_verified',
                Value: 'true'
            }
        ]
    };

    //Validating the user
    try {
        await CognitoIdentityServiceProvider.adminUpdateUserAttributes(params).promise();
        await authService.confirmUserEmail(email);

        const location = `${locationStartPath}/login#email_verification=success&email=${encodeURIComponent(email)}`;
        return {
            statusCode: 301,
            headers: {
                Location: location
            },
            body: ''
        };
    } catch (err) {
        console.error(err);
        const location = `${locationStartPath}/login#email_verification=failed&email=${encodeURIComponent(email)}`;
        return {
            statusCode: 301,
            headers: {
                Location: location
            },
            body: ''
        };
    }
};
