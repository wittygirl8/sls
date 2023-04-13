beforeEach(() => {
    jest.resetModules();
});

jest.mock('../../../layers/helper_lib/src/token-decoder', () => {
    return {
        getUserId: () => 'WwwuYAbZa6vN8smhNM-I8',
        decodeToken: () =>
            Promise.resolve({
                myPayUserId: '663184579',
                scopes: 'Merchant',
                merchants: '[663184566,663184575]'
            })
    };
});

test('[getRelationshipsByMerchantId] error is thrown -> returns 500', async () => {
    // Arrange
    jest.mock('../business-logic/team.service', () => {
        return {
            TeamService: jest.fn().mockImplementation(() => {
                return {
                    getRelationshipsByMerchantId: jest.fn().mockImplementation(() => {
                        throw 'Error';
                    })
                };
            })
        };
    });
    const { getTeamMembers } = require('../functions/team/get-team-members-handler');
    // Act
    const result = await getTeamMembers({});

    // Assert
    expect(result.statusCode).toBe(500);
});
test('[getUsersByIds] error is thrown -> returns 500', async () => {
    // Arrange
    jest.mock('../business-logic/team.service', () => {
        return {
            TeamService: jest.fn().mockImplementation(() => {
                return {
                    getUsersByIds: jest.fn().mockImplementation(() => {
                        throw 'Error';
                    })
                };
            })
        };
    });
    const { getTeamMembers } = require('../functions/team/get-team-members-handler');

    // Act
    const result = await getTeamMembers({});

    // Assert
    expect(result.statusCode).toBe(500);
});

test('[getTeamMembers] Team members fetched -> 200 is returned', async () => {
    // Arrange

    jest.mock('../business-logic/team.service', () => {
        const users = [{ userId: 'WwwuYAbZa6vN8smhNM-I8' }];
        const RelationshipsList = [
            {
                id: 'WwwuYAbZa6vN8smhNM-I8',
                userId: '0ZpjHWPQzmWzduC7EssWI',
                merchantId: 12345
            },
            {
                id: '77YeRdSrqivtJMhhnL_oT',
                userId: '6B9IYNrN1d9Iy5sLhuicY',
                merchantId: 12345
            }
        ];
        RelationshipsList.filter;
        return {
            TeamService: jest.fn().mockImplementation(() => {
                return {
                    getRelationshipsByMerchantId: jest.fn().mockImplementation(() => {
                        return RelationshipsList;
                    }),
                    getUsersByIds: jest.fn().mockImplementation(() => {
                        return users;
                    })
                };
            })
        };
    });
    const { getTeamMembers } = require('../functions/team/get-team-members-handler');

    // Act
    const result = await getTeamMembers({
        pathParameters: {
            id: '663184566'
        }
    });

    // Assert
    expect(result.statusCode).toBe(200);
});
