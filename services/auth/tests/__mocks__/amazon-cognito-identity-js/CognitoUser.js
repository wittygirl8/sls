function CognitoUser(data) {
    const { Username } = data;
    this.Username = Username;

    this.authenticateUser = jest.fn((authenticationDetails, callbacks) => {
        if (Username) {
            callbacks.onSuccess({
                getIdToken: function () {
                    return {
                        getJwtToken: function () {
                            return 'test-token';
                        },
                    };
                },
            });
        } else {
            callbacks.onFailure({ message: 'Username is not valid' });
        }
    });
}

module.exports = CognitoUser;
