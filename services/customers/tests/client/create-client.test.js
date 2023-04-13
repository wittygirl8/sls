jest.mock('dotenv');

jest.mock('../../../../layers/helper_lib/src/token-decoder');
jest.mock('../../../../layers/helper_lib/src/flake.generator');

var { connectDB } = require('../../../../layers/models_lib/src');

jest.mock('../../../../layers/models_lib/src');

var { getUserId } = require('../../../../layers/helper_lib/src/token-decoder');
var { flakeGenerateDecimal } = require('../../../../layers/helper_lib/src/flake.generator');
var { createClient } = require('../../functions/client/create-client-handler');

require('dotenv').config();

let userId;
let body;
let path;
let client;
let userRole;
let relationShip;

beforeEach(async () => {
    jest.resetAllMocks();

    getUserId.mockImplementation(() => 'ussrId');

    userId = await getUserId();

    body = {
        client: {
            name: 'ClientName'
        }
    };

    path = {
        businessId: 'businessId'
    };

    client = {
        businessId: path.businessId,
        name: body.client.name,
        id: flakeGenerateDecimal()
    };

    userRole = {
        id: flakeGenerateDecimal()
    };

    relationShip = {
        userId: userId,
        clientId: client.id,
        id: flakeGenerateDecimal(),
        roleId: userRole.id
    };
});

test('[createClient] Client save error', async () => {
    // Arrange
    connectDB.mockImplementation(() => ({
        Client: {
            build: jest.fn(() => {
                return {
                    client,
                    save: jest.fn().mockImplementation(() => {
                        throw new Error('Client DB exception');
                    })
                };
            }),
            findOne: jest.fn(() => {
                return null;
            })
        },
        Role: {
            findOne: jest.fn(() => {
                return {
                    userRole
                };
            })
        },
        Relationship: {
            build: jest.fn(() => {
                return {
                    relationShip,
                    save: jest.fn(() => {
                        return {
                            relationShip
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

    const expectedStatusCode = 500;

    // Act
    const result = await createClient({ body: JSON.stringify(body), pathParameters: JSON.stringify(path) });

    // Assert
    expect(result.statusCode).toBe(expectedStatusCode);
});

test('[createClient] Cannot find Role', async () => {
    // Arrange
    connectDB.mockImplementation(() => ({
        Client: {
            build: jest.fn(() => {
                return {
                    client,
                    save: jest.fn(() => {
                        return {
                            client
                        };
                    })
                };
            }),
            findOne: jest.fn(() => {
                return null;
            })
        },
        Role: {
            findOne: jest.fn().mockImplementation(() => {
                throw new Error('Not founded');
            })
        },
        Relationship: {
            build: jest.fn(() => {
                return {
                    relationShip,
                    save: jest.fn(() => {
                        return {
                            relationShip
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

    const expectedStatusCode = 500;

    // Act
    const result = await createClient({ body: JSON.stringify(body), pathParameters: JSON.stringify(path) });

    // Assert
    expect(result.statusCode).toBe(expectedStatusCode);
});

test('[createClient] Relationship save error', async () => {
    // Arrange
    connectDB.mockImplementation(() => ({
        Client: {
            build: jest.fn(() => {
                return {
                    client,
                    save: jest.fn(() => {
                        return {
                            client
                        };
                    })
                };
            }),
            findOne: jest.fn(() => {
                return null;
            })
        },
        Role: {
            findOne: jest.fn(() => {
                return {
                    userRole
                };
            })
        },
        Relationship: {
            build: jest.fn(() => {
                return {
                    relationShip,
                    save: jest.fn().mockImplementation(() => {
                        throw new Error('Relationship DB exception');
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
    const result = await createClient({ body: JSON.stringify(body), pathParameters: JSON.stringify(path) });

    // Assert
    expect(result.statusCode).toBe(expectedStatusCode);
});

test('[createClient] Create Client Success', async () => {
    // Arrange
    connectDB.mockImplementation(() => ({
        Client: {
            build: jest.fn(() => {
                return {
                    client,
                    save: jest.fn(() => {
                        return {
                            client
                        };
                    })
                };
            }),
            findOne: jest.fn(() => {
                return null;
            })
        },
        Role: {
            findOne: jest.fn(() => {
                return {
                    userRole
                };
            })
        },
        Relationship: {
            build: jest.fn(() => {
                return {
                    relationShip,
                    save: jest.fn(() => {
                        return {
                            relationShip
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

    const expectedStatusCode = 201;

    // Act
    const result = await createClient({ body: JSON.stringify(body), pathParameters: JSON.stringify(path) });

    // Assert
    expect(result.statusCode).toBe(expectedStatusCode);
});

test('[createClient] Create Client name already exists', async () => {
    // Arrange
    connectDB.mockImplementation(() => ({
        Client: {
            build: jest.fn(() => {
                return {
                    client,
                    save: jest.fn(() => {
                        return {
                            client
                        };
                    })
                };
            }),
            findOne: jest.fn(() => {
                return client;
            })
        },
        Role: {
            findOne: jest.fn(() => {
                return {
                    userRole
                };
            })
        },
        Relationship: {
            build: jest.fn(() => {
                return {
                    relationShip,
                    save: jest.fn(() => {
                        return {
                            relationShip
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

    const expectedStatusCode = 400;

    // Act
    const result = await createClient({ body: JSON.stringify(body), pathParameters: JSON.stringify(path) });

    // Assert
    expect(result.statusCode).toBe(expectedStatusCode);
});
