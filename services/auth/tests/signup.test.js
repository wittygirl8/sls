jest.doMock('../../../layers/models_lib/src', () => {
    const {
        SequelizeMock,
        UserMock,
        IdentityProviderMyPayRelationsMock,
        UserTypeMock,
        MerchantMock,
        RelationshipMock,
        RoleMock,
        ResellerMock
    } = require('../../../test-helpers/__mocks__');
    return {
        connectDB: () => ({
            User: UserMock.UserModel,
            UserType: UserTypeMock.UserTypeModel,
            Merchant: MerchantMock.MerchantModel,
            IdentityProviderMyPayRelations: IdentityProviderMyPayRelationsMock.IdentityProviderMyPayRelationsModel,
            Relationship: RelationshipMock.RelationshipModel,
            Role: RoleMock.RoleModel,
            Reseller: ResellerMock.ResellerModel,
            sequelize: SequelizeMock.sequelize,
            Sequelize: { Op: {} }
        })
    };
});

const SignUpHandler = require('../functions/signup-handler');
const { CognitoUserPool, CognitoUserAttribute } = require('amazon-cognito-identity-js');
const { response } = require('../../../layers/helper_lib/src/response.helper');
const { MerchantMock } = require('../../../test-helpers/__mocks__');

test('[signUp] Request body is undefined', async (done) => {
    const expectedStatusCode = 400;

    const result = await SignUpHandler.signUp({});
    expect(result.statusCode).toBe(expectedStatusCode);
    expect(CognitoUserAttribute).toHaveBeenCalledTimes(0);
    done();
});

test('[signUp] Cognito returns an error', async (done) => {
    const expectedMessage = 'Email already exists';
    const expectedResponce = response({ error: 'Internal server error', statusCode: 400 }, 400);
    var requestBody = {
        email: 'test123@mail.com',
        password: '112345142',
        userType: 'Merchant'
    };

    CognitoUserPool.mock.instances[0].signUp = (username, password, attributes, validation, callback) => {
        expect(username).toBe(requestBody.username);
        expect(password).toBe(requestBody.password);

        // cognito failed to sign up user and returned an error message
        callback({ message: expectedMessage }, false);
    };

    const result = await SignUpHandler.signUp({ body: JSON.stringify(requestBody) });
    expect(result).toMatchObject(expectedResponce);
    expect(CognitoUserPool).toHaveBeenCalledTimes(1);
    expect(CognitoUserAttribute).toHaveBeenCalledTimes(3);
    done();
});

test('[signUp] User is signed up succesfully', async (done) => {
    const expectedResult = response({}, 201);

    var requestBody = {
        email: 'test1234@mail.com',
        password: '112345142',
        userType: 'Reseller'
    };

    CognitoUserPool.mock.instances[0].signUp = (username, password, attributes, validation, callback) => {
        expect(username).toBe(requestBody.username);
        expect(password).toBe(requestBody.password);

        // cognito registered succesfully the user
        callback(null, true);
    };

    const result = await SignUpHandler.signUp({ body: JSON.stringify(requestBody) });
    expect(result).toMatchObject(expectedResult);
    expect(CognitoUserPool).toHaveBeenCalledTimes(1);
    expect(CognitoUserAttribute).toHaveBeenCalledTimes(3);
    done();
});

// test('[signUp] User type is invalid and error is thrown', async () => {
//     // Arrange
//     const expectedResult = response(
//         {
//             error: 'User Type is not valid'
//         },
//         400
//     );

//     var requestBody = {
//         email: 'test1234@mail.com',
//         password: '112345142',
//         userType: 'Mercha'
//     };

//     // Act
//     const result = await SignUpHandler.signUp({ body: JSON.stringify(requestBody) });

//     // Assert
//     expect(result).toMatchObject(expectedResult);
// });

test('[signUp] User is signed up as Merchant and merchant entity is created', async () => {
    const expectedResult = response({}, 201);

    var requestBody = {
        email: 'testMerchantUser@mail.com',
        password: '112345142',
        userType: 'Merchant'
    };

    const merchantsCountBefore = MerchantMock.MerchantList.length;

    CognitoUserPool.mock.instances[0].signUp = (username, password, attributes, validation, callback) => {
        expect(username).toBe(requestBody.username);
        expect(password).toBe(requestBody.password);

        // cognito registered succesfully the user
        callback(null, true);
    };

    const result = await SignUpHandler.signUp({ body: JSON.stringify(requestBody) });
    const merchantsCountAfter = MerchantMock.MerchantList.length;
    expect(result).toMatchObject(expectedResult);
    expect(CognitoUserPool).toHaveBeenCalledTimes(1);
    expect(CognitoUserAttribute).toHaveBeenCalledTimes(3);
    expect(merchantsCountAfter).toBe(merchantsCountBefore + 2);
});

afterEach(() => {
    CognitoUserAttribute.mockClear();
});
