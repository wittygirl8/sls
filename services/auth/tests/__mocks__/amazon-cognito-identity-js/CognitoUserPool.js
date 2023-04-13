function CognitoUserPool(data) {
    const { UserPoolId, ClientId } = data;
    this.userPoolId = UserPoolId;
    this.clientId = ClientId;
}

module.exports = CognitoUserPool;
