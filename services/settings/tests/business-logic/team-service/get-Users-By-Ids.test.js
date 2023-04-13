beforeEach(() => {
    jest.resetModules();

    jest.mock('../../../../../layers/models_lib/src', () => {
        const { SequelizeMock } = require('../../../../../test-helpers/__mocks__');
        return {
            connectDB: () => ({
                sequelize: SequelizeMock.sequelize
            })
        };
    });
});

test('[getUsersByIds] returns correct entity', async () => {
    //Arrange
    jest.mock('../../../../../libs/repo/user-team.repo', () => {
        return {
            UserTeamRepo: jest.fn().mockImplementation(() => {
                return {
                    findAll: jest.fn().mockImplementation(() => {
                        return {
                            name: 'User'
                        };
                    })
                };
            })
        };
    });
    const { TeamService } = require('../../../business-logic/team.service');
    const teamService = new TeamService();

    // Act
    const result = await teamService.getUsersByIds('123');

    // Assert
    expect(result.name).toBe('User');
});

test('[getRelationshipsByUserId] repositry throws an error', async () => {
    //Arrange
    jest.mock('../../../../../libs/repo/user-team.repo', () => {
        return {
            UserTeamRepo: jest.fn().mockImplementation(() => {
                return {
                    findAll: jest.fn().mockImplementation(() => {
                        throw 'Error';
                    })
                };
            })
        };
    });
    const { TeamService } = require('../../../business-logic/team.service');
    const teamService = new TeamService();

    // Act
    try {
        await teamService.getUsersByIds('123');
    } catch (error) {
        expect(error).toBe('Error');
    }
});

test('[getUsersByIds] entities are fetched', async () => {
    //Arrange
    jest.mock('../../../../../libs/repo/user-team.repo', () => {
        return {
            UserTeamRepo: jest.fn().mockImplementation(() => {
                return {
                    findAll: jest.fn().mockImplementation(() => {
                        return {
                            UserList: [
                                {
                                    id: '6Qc2rZbKcXOZqGRElqIvt',
                                    firstName: 'Aswe',
                                    lastName: 'Hold',
                                    email: 'aswe@gmail.com'
                                },
                                {
                                    id: 'aJatoBvMJuFOh_o1mcFG6',
                                    firstName: 'Nava',
                                    lastName: 'Illap',
                                    email: 'nava@gmail.com'
                                }
                            ]
                        };
                    })
                };
            })
        };
    });
    const { TeamService } = require('../../../business-logic/team.service');
    const teamService = new TeamService();

    // Act
    const usersIds = ['6Qc2rZbKcXOZqGRElqIvt', 'aJatoBvMJuFOh_o1mcFG6'];
    const result = await teamService.getUsersByIds(usersIds);

    expect(result).not.toBeNull();
    expect(result.UserList.length).toBe(2);
});
