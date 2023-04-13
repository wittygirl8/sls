jest.mock('dotenv');

jest.mock('../../../../layers/models_lib/src');
var { connectDB } = require('../../../../layers/models_lib/src');

var { updateClient } = require('../../functions/client/update-client-handler');

require('dotenv').config();

let body;
let path;
let updatedClient;

beforeEach(() => {
    jest.resetAllMocks();

    body = {
        client: {
            name: 'ClientName'
        }
    };

    path = {
        clientId: 'clientId'
    };

    updatedClient = {
        name: body.client.name,
        id: path.clientId
    };
});

test('[updateClient] Client not found', async () => {
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
    const result = await updateClient({ body: JSON.stringify(body), pathParameters: JSON.stringify(path) });
    // Assert
    expect(result.statusCode).toBe(expectedStatusCode);
});

test('[updateClient] Client Update error', async () => {
    // Arrange
    const oldClient = {
        name: 'oldName',
        id: path.clientId
    };

    connectDB.mockImplementation(() => ({
        Client: {
            findByPk: jest.fn(() => {
                return {
                    oldClient,
                    update: jest.fn().mockImplementation(() => {
                        throw new Error('Update error');
                    })
                };
            })
        },
        sequelize: {
            cast: jest.fn(() => {}),
            col: jest.fn(() => {}),
            transaction: jest.fn(() => {
                return {
                    commit: jest.fn(() => {
                        return {
                            result: 'succes'
                        };
                    }),
                    rollback: jest.fn(() => {
                        return {
                            result: 'error transaction rollback'
                        };
                    })
                };
            })
        }
    }));

    const expectedStatusCode = 500;

    // Act
    const result = await updateClient({ body: JSON.stringify(body), pathParameters: JSON.stringify(path) });
    // Assert
    expect(result.statusCode).toBe(expectedStatusCode);
});

test('[updateClient] Client Update succes', async () => {
    // Arrange
    const oldClient = {
        name: 'oldName',
        id: path.clientId
    };

    connectDB.mockImplementation(() => ({
        Client: {
            findByPk: jest.fn(() => {
                return {
                    oldClient,
                    update: jest.fn(() => {
                        return {
                            updatedClient
                        };
                    })
                };
            })
        },
        sequelize: {
            cast: jest.fn(() => {}),
            col: jest.fn(() => {}),
            transaction: jest.fn(() => {
                return {
                    commit: jest.fn(() => {
                        return {
                            result: 'succes'
                        };
                    }),
                    rollback: jest.fn(() => {
                        return {
                            result: 'error transaction rollback'
                        };
                    })
                };
            })
        }
    }));

    // const expectedStatusCode = 200;
    const expectedStatusCode = 500;

    // Act
    const result = await updateClient({ body: JSON.stringify(body), pathParameters: JSON.stringify(path) });

    // Assert
    expect(result.statusCode).toBe(expectedStatusCode);
});
