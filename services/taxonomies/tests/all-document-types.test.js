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

test('[findAll] returns all doc types', async () => {
    //Arrange
    jest.mock('../../../libs/repo/document-type.repo', () => {
        return {
            DocumentTypeRepo: jest.fn().mockImplementation(() => {
                return {
                    findAll: jest.fn().mockImplementation(() => {
                        return [
                            {
                                id: '4123',
                                name: 'Test 1',
                                description: 'description 1'
                            },
                            {
                                id: '523523',
                                name: 'Test 2',
                                description: 'description 2'
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
    const result = await taxonomyService.findAllDocumentTypes();

    // Assert
    expect(result.length).toBe(2);
});

test('[findAll] repository throws an error for doc types', async () => {
    //Arrange
    jest.mock('../../../libs/repo/document-type.repo', () => {
        return {
            DocumentTypeRepo: jest.fn().mockImplementation(() => {
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
        await taxonomyService.findAllDocumentTypes();
    } catch (error) {
        expect(error).toBe('Error');
    }
});
