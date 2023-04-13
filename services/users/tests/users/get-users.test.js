beforeEach(() => {
    jest.resetModules();

    jest.mock('../../../../layers/helper_lib/src/token-decoder', () => {
        return {
            getUserId: () => '123456',
        };
    });
});

test('[getUsers] Users are fetched properly', async () => {
    jest.doMock('../../../../layers/models_lib/src', () => {
        const relationshipMock = require('../../../../test-helpers/__mocks__').RelationshipMock.RelationshipsList[1];
        const usersModel = require('../../../../test-helpers/__mocks__').UserMock.UserModel;
        relationshipMock.Business = {
            name: 'Business 1',
            Clients: [],
        };

        return {
            connectDB: () => ({
                Relationship: {
                    findAll: jest.fn(() => {
                        return [relationshipMock];
                    }),
                },
                User: usersModel,
                Sequelize: {
                    Op: jest.fn(() => {}),
                    or: jest.fn(() => {}),
                },
                sequelize: {
                    cast: jest.fn(() => {}),
                    col: jest.fn(() => {}),
                },
            }),
        };
    });

    const getUsersHandler = require('../../functions/get-users-handler');

    const result = await getUsersHandler.getUsers();

    const users = JSON.parse(result.body).users;
    expect(users.length).toBe(1);
    expect(users[0].id).toBe('aJatoBvMJuFOh_o1mcFG6');
});

test('[getUsers] database query throws an error', async () => {
    jest.doMock('../../../../layers/models_lib/src', () => {
        return {
            connectDB: () => ({
                Relationship: {
                    findAll: jest.fn(() => {
                        throw 'Error';
                    }),
                },
                Sequelize: {
                    Op: jest.fn(() => {}),
                    or: jest.fn(() => {}),
                },
            }),
        };
    });

    const getUsersHandler = require('../../functions/get-users-handler');

    const result = await getUsersHandler.getUsers();
    expect(result.statusCode).toBe(500);
});
