var { AuthCognitoService } = require('../business-logic/auth-cognito.service');
const authCognitoService = new AuthCognitoService();

export const addUserMyPayIdToCognitoToken = async (event) => {
    try {
        const amazonIdentifier = event.userName;

        const useFederatedIdentities = amazonIdentifier.startsWith('Google') || amazonIdentifier.startsWith('Facebook');
        const claims = await authCognitoService.addClaims(amazonIdentifier, useFederatedIdentities);

        if (claims) {
            const userType = claims.user.UserType;
            event.response = {
                claimsOverrideDetails: {
                    claimsToAddOrOverride: {
                        host: 'www.dummy-gfsasd.web.com',
                        myPayUserId: claims.myPayUserId,
                        merchants: JSON.stringify(claims.merchants),
                        scopes: userType ? userType.name: ''
                    }
                }
            };
        }

        // Return to Amazon Cognito
        return event;
    } catch (err) {
        console.error(err);
        throw err;
    }
};
