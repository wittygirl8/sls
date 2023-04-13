beforeEach(() => {
    jest.resetModules();
});

test('[deleteRelationship] error is thrown -> returns 500', async () => {
    // Arrange
    jest.mock('../business-logic/team.service', () => {
        return {
            TeamService: jest.fn().mockImplementation(() => {
                return {
                    deleteRelationship: jest.fn().mockImplementation(() => {
                        throw 'Error';
                    })
                };
            })
        };
    });
    const { deleteTeamMember } = require('../functions/team/delete-team-member-handler');
    // Act
    const result = await deleteTeamMember({});

    // Assert
    expect(result.statusCode).toBe(500);
});

test('[deleteRelationship] success -> 200 is returned', async () => {
    // Arrange

    jest.mock('../business-logic/team.service', () => {
        const resultTest = {
            operationStatus: true,
            data: {
                id: '6693410635885051909',
                userId: '6692403834892845056',
                businessId: null,
                clientId: null,
                merchantId: '6693410635864080384',
                roleId: '6692332451525558272'
            }
        };

        return {
            TeamService: jest.fn().mockImplementation(() => {
                return {
                    deleteRelationship: jest.fn().mockImplementation(() => {
                        return resultTest;
                    })
                };
            })
        };
    });
    const { deleteTeamMember } = require('../functions/team/delete-team-member-handler');

    // Act
    const result = await deleteTeamMember({
        pathParameters: {
            id: '6693410635885051909'
        }
    });

    // Assert
    expect(result.statusCode).toBe(200);
});
