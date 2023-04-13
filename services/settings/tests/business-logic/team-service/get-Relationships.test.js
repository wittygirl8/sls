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

test('[getRelationshipsByMerchantId] returns correct entity', async () => {
    //Arrange
    jest.mock('../../../../../libs/repo/relationship.repo', () => {
        return {
            RelationshipRepo: jest.fn().mockImplementation(() => {
                return {
                    findAll: jest.fn().mockImplementation(() => {
                        return {
                            name: 'Relationship'
                        };
                    })
                };
            })
        };
    });
    const { TeamService } = require('../../../business-logic/team.service');
    const teamService = new TeamService();

    // Act
    const result = await teamService.getRelationshipsByMerchantId('123');

    // Assert
    expect(result.name).toBe('Relationship');
});

test('[getRelationshipsByMerchantId] repositry throws an error', async () => {
    //Arrange
    jest.mock('../../../../../libs/repo/relationship.repo', () => {
        return {
            RelationshipRepo: jest.fn().mockImplementation(() => {
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
        await teamService.getRelationshipsByMerchantId('123');
    } catch (error) {
        expect(error).toBe('Error');
    }
});

test('[getRelationshipsByMerchantsIds] entities are fetched', async () => {
    //Arrange
    jest.mock('../../../../../libs/repo/relationship.repo', () => {
        return {
            RelationshipRepo: jest.fn().mockImplementation(() => {
                return {
                    findAll: jest.fn().mockImplementation(() => {
                        return {
                            relationships: [
                                {
                                    id: 'WwwuYAbZa6vN8smhNM-I8',
                                    userId: '0ZpjHWPQzmWzduC7EssWI',
                                    businessId: '-nYNgl4zquGghT3DXdWJs',
                                    clientId: null,
                                    merchantId: 12345
                                },
                                {
                                    id: '77YeRdSrqivtJMhhnL_oT',
                                    userId: '6B9IYNrN1d9Iy5sLhuicY',
                                    businessId: 'rJJu0JuLuxCgU7pWm7na6',
                                    clientId: null,
                                    merchantId: 12345
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
    const merchantId = 12345;
    const result = await teamService.getRelationshipsByMerchantId(merchantId);

    expect(result).not.toBeNull();
    expect(result.relationships.length).toBe(2);
});
