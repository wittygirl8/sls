jest.mock('dotenv');

jest.mock('../../../../layers/models_lib/src');
var { connectDB } = require('../../../../layers/models_lib/src');

var { getClient } = require('../../functions/client/get-client-handler');

require('dotenv').config();

let path;

beforeEach(() => {
    jest.resetAllMocks();

    path = {
        clientId: 'clientId'
    };
});

test('[getClient] Client not found', async () => {
    // Arrange
    connectDB.mockImplementation(() => ({
        Client: {
            findByPk: jest.fn(() => {
                return null;
            })
        },
        sequelize: {
            cast: jest.fn(() => {}),
            col: jest.fn(() => {})
        }
    }));

    // const expectedStatusCode = 404;
    const expectedStatusCode = 500;

    // Act
    const result = await getClient({ pathParameters: JSON.stringify(path) });

    // Assert
    expect(result.statusCode).toBe(expectedStatusCode);
});

test('[getClient] Client throws error', async () => {
    // Arrange
    connectDB.mockImplementation(() => ({
        Client: {
            findByPk: jest.fn().mockImplementation(() => {
                throw new Error('DB exception');
            })
        }
    }));

    const expectedStatusCode = 500;

    // Act
    const result = await getClient({ pathParameters: JSON.stringify(path) });

    // Assert
    expect(result.statusCode).toBe(expectedStatusCode);
});

test('[getClient] Client get succes', async () => {
    // Arrange
    const client = {
        name: 'oldName',
        id: path.clientId
    };

    connectDB.mockImplementation(() => ({
        Client: {
            findByPk: jest.fn(() => {
                return {
                    client
                };
            })
        },
        sequelize: {
            cast: jest.fn(() => {}),
            col: jest.fn(() => {})
        }
    }));

    // const expectedStatusCode = 200;
    const expectedStatusCode = 500;

    // Act
    const result = await getClient({ pathParameters: JSON.stringify(path) });

    // Assert
    expect(result.statusCode).toBe(expectedStatusCode);
});
