beforeEach(() => {
    jest.resetModules();
    jest.doMock('../../../../layers/models_lib/src', () => {
        const {
            SequelizeMock,
            UserMock,
            RelationshipMock,
            IdentityProviderMyPayRelationsMock,
            UserTypeMock,
            MerchantMock,
            ResellerMock
        } = require('../../../../test-helpers/__mocks__');
        return {
            connectDB: () => ({
                User: UserMock.UserModel,
                Merchant: MerchantMock.MerchantModel,
                Relationship: RelationshipMock.RelationshipModel,
                IdentityProviderMyPayRelations: IdentityProviderMyPayRelationsMock.IdentityProviderMyPayRelationsModel,
                UserType: UserTypeMock.UserTypeModel,
                Reseller: ResellerMock.ResellerModel,
                sequelize: SequelizeMock.sequelize,
                Sequelize: { Op: {} },
                Role: {
                    findOne: () => '234234234325'
                }
            })
        };
    });
});

test('[connectSocialAccountWithMyPayUser] User not exist create one', async () => {
    // Arrange
    const { UserMock, IdentityProviderMyPayRelationsMock } = require('../../../../test-helpers/__mocks__');

    UserMock.setUserOptions({ isUpdateDeleteMode: true });
    const { AuthCognitoService } = require('../../business-logic/auth-cognito.service');
    const authCognitoService = new AuthCognitoService();
    const usersCount = UserMock.UserList.length;
    const identityCount = IdentityProviderMyPayRelationsMock.IdentityProviderMyPayRelationsList.length;
    const cognitoId = 'Google_Idsdsds';
    const userData = {
        email_verified: false,
        given_name: 'Mega Name',
        family_name: 'Name',
        email: 'Email@email.com'
    };

    // Act
    await authCognitoService.connectSocialAccountWithMyPayUser(cognitoId, userData, 'Cognito');

    // Assert
    const usersCountAfterUpdate = UserMock.UserList.length;
    const identityCountAfterUpdate = IdentityProviderMyPayRelationsMock.IdentityProviderMyPayRelationsList.length;
    expect(usersCountAfterUpdate).toBe(usersCount + 1);
    expect(identityCountAfterUpdate).toBe(identityCount + 1);
});
