beforeEach(() => {
    jest.resetModules();

    jest.mock('../../../layers/models_lib/src', () => {
        const { SequelizeMock } = require('../../../test-helpers/__mocks__');
        return {
            connectDB: () => ({
                sequelize: SequelizeMock.sequelize
            })
        };
    });
});

test('[findAll] returns all entities', async () => {
    //Arrange
    jest.mock('../../../libs/repo/business-description.repo', () => {
        return {
            BusinessDescriptionRepo: jest.fn().mockImplementation(() => {
                return {
                    findAll: jest.fn().mockImplementation(() => {
                        return [
                            {
                                id: '6453',
                                name: 'description 1'
                            }
                        ];
                    })
                };
            })
        };
    });

    const { TaxonomyService } = require('../business-logic/taxonomy.service');
    const taxonomyService = new TaxonomyService();

    // Act
    const result = await taxonomyService.findAllBusinessDescriptions();

    // Assert
    expect(result.length).toBe(1);
});

test('[findAll] repository throws an error', async () => {
    //Arrange
    jest.mock('../../../libs/repo/business-description.repo', () => {
        return {
            BusinessDescriptionRepo: jest.fn().mockImplementation(() => {
                return {
                    findAll: jest.fn().mockImplementation(() => {
                        throw 'Error';
                    })
                };
            })
        };
    });

    const { TaxonomyService } = require('../business-logic/taxonomy.service');
    const taxonomyService = new TaxonomyService();

    // Act
    try {
        await taxonomyService.findAllBusinessDescriptions();
    } catch (error) {
        expect(error).toBe('Error');
    }
});
