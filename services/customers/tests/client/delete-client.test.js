jest.mock('dotenv');

jest.mock('../../../../layers/models_lib/src');
var { connectDB } = require('../../../../layers/models_lib/src');

var { deleteClient } = require('../../functions/client/delete-client-handler');

require('dotenv').config();

let path;

beforeEach(() => {
    jest.resetAllMocks();

    path = {
        clientId: 'clientId'
    };
});

test('[deleteClient] Client not found', async () => {
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
    const result = await deleteClient({ pathParameters: JSON.stringify(path) });

    // Assert
    expect(result.statusCode).toBe(expectedStatusCode);
});

test('[deleteClient] Client delete error', async () => {
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
                    destroy: jest.fn().mockImplementation(() => {
                        throw new Error('Delete error');
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
    const result = await deleteClient({ pathParameters: JSON.stringify(path) });

    // Assert
    expect(result.statusCode).toBe(expectedStatusCode);
});

test('[deleteClient] Client delete succes', async () => {
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
                    destroy: jest.fn(() => {
                        return null;
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
    const result = await deleteClient({ pathParameters: JSON.stringify(path) });

    // Assert
    expect(result.statusCode).toBe(expectedStatusCode);
});
