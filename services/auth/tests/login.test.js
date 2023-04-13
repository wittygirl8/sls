jest.doMock('../../../layers/models_lib/src', () => {
    const { SequelizeMock, UserMock } = require('../../../test-helpers/__mocks__');
    return {
        connectDB: () => ({
            User: UserMock.UserModel,
            sequelize: SequelizeMock.sequelize,
            Sequelize: { Op: {} },
        }),
    };
});

const LogInHandler = require('../functions/login-handler');
const { CognitoUser, AuthenticationDetails } = require('amazon-cognito-identity-js');

test('Request body is not valid', async (done) => {
    const expectedStatusCode = 400;
    const result = await LogInHandler.login({});
    expect(result.statusCode).toBe(expectedStatusCode);
    expect(CognitoUser).toHaveBeenCalledTimes(0);
    expect(AuthenticationDetails).toHaveBeenCalledTimes(0);
    done();
});

test('Cognito returns an error', async (done) => {
    const expectedStatusCode = 400;
    const expectedMessage = 'Username is not valid';

    const requestBody = {
        username: '',
        password: '',
    };

    const result = await LogInHandler.login({ body: JSON.stringify(requestBody) });
    expect(result.statusCode).toBe(expectedStatusCode);
    expect(CognitoUser).toHaveBeenCalledTimes(1);
    expect(AuthenticationDetails).toHaveBeenCalledTimes(1);
    expect(JSON.parse(result.body).message).toBe(expectedMessage);
    done();
});

test('User is autheticated succesfully', async (done) => {
    const expectedStatusCode = 200;
    const expectedToken = 'test-token';

    const requestBody = {
        username: 'aswe@gmail.com',
        password: '132423432',
    };

    const result = await LogInHandler.login({ body: JSON.stringify(requestBody) });
    expect(result.statusCode).toBe(expectedStatusCode);
    expect(CognitoUser).toHaveBeenCalledTimes(1);
    expect(AuthenticationDetails).toHaveBeenCalledTimes(1);
    expect(JSON.parse(result.body).token).toBe(expectedToken);
    done();
});

afterEach(() => {
    CognitoUser.mockClear();
    AuthenticationDetails.mockClear();
});
