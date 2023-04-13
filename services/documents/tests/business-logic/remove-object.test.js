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

test('[removeObject] Remove Object error', async () => {
    //Arrange
    jest.mock('../../../../libs/repo/document.repo', () => {
        return {
            DocumentRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return { id: '35345' };
                    }),

                    update: jest.fn().mockImplementation(() => {
                        throw new Error('Client DB exception');
                    })
                };
            })
        };
    });

    const { DocumentService } = require('../../business-logic/document.service');

    // Act
    try {
        await new DocumentService({}).removeDocument('merchant', '4645646456', '35345345', {
            filename: 'qwerty.go',
            size: '1424567'
        });
    } catch (error) {
        console.log('error===', error);
        // Assert
        expect(error).toBeInstanceOf(Error);
        expect(error).toHaveProperty('message', 'Client DB exception');
    }
});

test('[removeObject] Remove Object aws error', async () => {
    //Arrange
    jest.mock('../../../../libs/repo/document.repo', () => {
        return {
            DocumentRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return { id: '35345' };
                    }),
                    destroy: jest.fn().mockImplementation(() => {
                        return true;
                    }),
                    update: jest.fn().mockImplementation(() => {
                        return true;
                    })
                };
            })
        };
    });

    var AWSMock = require('aws-sdk-mock');

    AWSMock.mock('S3', 'deleteObject', (_params, callback) => {
        callback(new Error('Some error'), null);
    });

    const { DocumentService } = require('../../business-logic/document.service');

    // Act
    try {
        await new DocumentService({}).removeDocument('merchant', '4645646456', '435645645645', {
            filename: 'qwerty.go',
            size: '1424567'
        });
    } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(Error);
        expect(error).toHaveProperty('message', 'Some error');
    }
});

test('[removeObject] Remove Object success', async () => {
    //Arrange
    jest.mock('../../../../libs/repo/document.repo', () => {
        return {
            DocumentRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return { id: '35345' };
                    }),
                    destroy: jest.fn().mockImplementation(() => {
                        return true;
                    }),
                    update: jest.fn().mockImplementation(() => {
                        return true;
                    })
                };
            })
        };
    });

    const { DocumentRepo } = require('../../../../libs/repo/document.repo');

    var AWSMock = require('aws-sdk-mock');

    AWSMock.mock('S3', 'deleteObject', (_params, callback) => {
        callback(null, 'Delete success');
    });

    const { DocumentService } = require('../../business-logic/document.service');

    // Act
    await new DocumentService({}).removeDocument('merchant', '4645646456', '543645645', {
        filename: 'qwerty.go',
        size: '1424567'
    });

    // Assert
    expect(DocumentRepo).toHaveBeenCalledTimes(1);
});
