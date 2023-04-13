beforeEach(() => {
    jest.resetModules();

    jest.mock('../../../../layers/models_lib/src', () => {
        const { SequelizeMock } = require('../../../../test-helpers/__mocks__');
        return {
            connectDB: () => ({
                sequelize: SequelizeMock.sequelize,
                Sequelize: {
                    Op: {}
                }
            })
        };
    });
});

test('[saveObject] Save Object error', async () => {
    //Arrange
    jest.mock('../../../../libs/repo/document.repo', () => {
        return {
            DocumentRepo: jest.fn().mockImplementation(() => {
                return {
                    save: jest.fn().mockImplementation(() => {
                        throw new Error('Client DB exception');
                    }),
                    findOne: jest.fn().mockImplementation(() => {
                        return true;
                    })
                };
            })
        };
    });

    jest.mock('../../../../layers/helper_lib/src/document-helpers', () => {
        return {
            createNewDocument: jest.fn().mockImplementation(() => {
                return true;
            })
        };
    });

    var AWSMock = require('aws-sdk-mock');

    AWSMock.mock('S3', 'deleteObject', (_params, callback) => {
        callback(null, 'Delete success');
    });

    const { DocumentService } = require('../../business-logic/document.service');

    // Act
    try {
        await new DocumentService({}).saveObject('merchant', '4645646456', '34543534', {
            filename: 'qwerty.go',
            size: '1424567'
        });
    } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(Error);
        expect(error).toHaveProperty('message', 'Client DB exception');
    }
});

test('[saveObject] Save Object success', async () => {
    //Arrange
    jest.mock('../../../../libs/repo/document.repo', () => {
        return {
            DocumentRepo: jest.fn().mockImplementation(() => {
                return {
                    save: jest.fn().mockImplementation(() => {
                        return { id: '67979789789' };
                    }),
                    findOne: jest.fn().mockImplementation(() => {
                        return true;
                    })
                };
            })
        };
    });

    jest.mock('../../../../layers/helper_lib/src/document-helpers', () => {
        return {
            createNewDocument: jest.fn().mockImplementation(() => {
                return true;
            })
        };
    });

    const { DocumentRepo } = require('../../../../libs/repo/document.repo');
    const { DocumentService } = require('../../business-logic/document.service');

    // Act
    await new DocumentService({}).saveObject('merchant', '4645646456', '435345345', {
        filename: 'qwerty.go',
        size: '1424567'
    });
    // Assert
    expect(DocumentRepo).toHaveBeenCalledTimes(1);
});
