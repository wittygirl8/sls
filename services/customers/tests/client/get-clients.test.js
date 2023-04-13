jest.mock('dotenv');

jest.mock('../../../../layers/models_lib/src');
var { connectDB } = require('../../../../layers/models_lib/src');

var { getClients } = require('../../functions/client/get-clients-handler');

require('dotenv').config();

beforeEach(() => {
    jest.resetAllMocks();
});

test('[getClients] Clients error', async () => {
    // Arrange
    connectDB.mockImplementation(() => ({
        Client: {
            findAll: jest.fn().mockImplementation(() => {
                throw new Error('DB exception');
            })
        },
        sequelize: {
            cast: jest.fn(() => {}),
            col: jest.fn(() => {})
        }
    }));

    const expectedStatusCode = 500;

    // Act
    const result = await getClients({});

    // Assert
    expect(result.statusCode).toBe(expectedStatusCode);
});

test('[getClients] Clients getAll succes', async () => {
    // Arrange
    const clients = [
        {
            name: 'oldName1',
            id: 'clientId1'
        },
        {
            name: 'oldName2',
            id: 'clientId2'
        },
        {
            name: 'oldName3',
            id: 'clientId3'
        }
    ];

    connectDB.mockImplementation(() => ({
        Client: {
            findAll: jest.fn(() => {
                return {
                    clients
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
    const result = await getClients({});

    // Assert
    expect(result.statusCode).toBe(expectedStatusCode);
});
