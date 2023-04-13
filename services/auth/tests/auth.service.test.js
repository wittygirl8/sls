beforeEach(() => {
    jest.resetModules();
    jest.doMock('../../../layers/models_lib/src', () => {
        const {
            SequelizeMock,
            UserMock,
            RelationshipMock,
            IdentityProviderMyPayRelationsMock,
            UserTypeMock,
            MerchantMock
        } = require('../../../test-helpers/__mocks__');
        return {
            connectDB: () => ({
                User: UserMock.UserModel,
                Merchant: MerchantMock.MerchantModel,
                Relationship: RelationshipMock.RelationshipModel,
                IdentityProviderMyPayRelations: IdentityProviderMyPayRelationsMock.IdentityProviderMyPayRelationsModel,
                UserType: UserTypeMock.UserTypeModel,
                sequelize: SequelizeMock.sequelize,
                Sequelize: { Op: {} },
                Role: {
                    findOne: () => '234234234325'
                }
            })
        };
    });
});

test('[saveRefreshToken] Save token from user - success', async () => {
    // Arrange
    const { UserMock } = require('../../../test-helpers/__mocks__');
    const { AuthService } = require('../business-logic/auth.service');
    UserMock.resetUserOptions();
    UserMock.setUserOptions({ isUpdateDeleteMode: true });
    const user = UserMock.UserList[0];
    const authService = new AuthService();
    const newRefreshToken = 'New Refresh token';
    // Act
    await authService.saveRefreshToken(user.id, newRefreshToken);

    const changedUser = UserMock.UserList[0];
    // Assert
    expect(changedUser.refreshToken).toBe(newRefreshToken);
});

test('[deleteRefreshToken] Delete token from user - success', async () => {
    // Arrange
    const { UserMock } = require('../../../test-helpers/__mocks__');
    const { AuthService } = require('../business-logic/auth.service');
    UserMock.resetUserOptions();
    UserMock.setUserOptions({ isUpdateDeleteMode: true });
    const user = UserMock.UserList[0];
    const authService = new AuthService();
    // Act
    await authService.deleteRefreshToken(user.id);

    // Assert
    const changedUser = UserMock.UserList[1];
    expect(changedUser.refreshToken).toBeNull();
});

test('[getRefreshToken] Get token from user - success', async () => {
    // Arrange
    const { UserMock } = require('../../../test-helpers/__mocks__');
    const { AuthService } = require('../business-logic/auth.service');
    UserMock.resetUserOptions();
    const user = UserMock.UserList[0];
    const authService = new AuthService();

    // Act
    const result = await authService.getRefreshToken(user.id);

    // Assert
    expect(result.refreshToken).toBe(user.refreshToken);
});
