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

test('[getRelationshipsByMerchantId] repositry throws an error', async () => {
    //Arrange
    jest.mock('../../../../../libs/repo/relationship.repo', () => {
        return {
            RelationshipRepo: jest.fn().mockImplementation(() => {
                return {
                    delete: jest.fn().mockImplementation(() => {
                        throw 'Error';
                    }),
                    findByPk: jest.fn().mockImplementation(() => {
                        return {};
                    })
                };
            })
        };
    });
    const { TeamService } = require('../../../business-logic/team.service');
    const teamService = new TeamService();

    // Act
    try {
        await teamService.deleteRelationship('123');
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
                    findByPk: jest.fn().mockImplementation(() => {
                        return {
                            id: 'ynhuk55a4s4aas_as_iik',
                            userId: '0ZpjHWPQzmWzduC7EssWI',
                            businessId: 'rJJu0JuLuxCgU7pWm7na6',
                            clientId: null,
                            merchantId: null,
                            roleId: 'frJUbUlogbyKAFipiiuyb'
                        };
                    }),
                    delete: jest.fn().mockImplementation(() => {
                        return {
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
                    })
                };
            })
        };
    });
    const { TeamService } = require('../../../business-logic/team.service');
    const teamService = new TeamService();

    // Act
    const id = 'ynhuk55a4s4aas_as_iik';
    const result = await teamService.deleteRelationship(id);

    expect(result).not.toBeNull();
    expect(result.operationStatus).toBe(true);
});
