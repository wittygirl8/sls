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

test('[listObjects] FindAll error', async () => {
    //Arrange
    jest.mock('../../../../libs/repo/document.repo', () => {
        return {
            DocumentRepo: jest.fn().mockImplementation(() => {
                return {
                    findAll: jest.fn().mockImplementation(() => {
                        throw new Error('Client DB exception');
                    })
                };
            })
        };
    });

    const { DocumentService } = require('../../business-logic/document.service');

    // Act
    try {
        await new DocumentService({}).findAll('merchant', '4645646456');
    } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(Error);
        expect(error).toHaveProperty('message', 'Client DB exception');
    }
});

test('[listObjects] FindAll success', async () => {
    //Arrange
    jest.mock('../../../../libs/repo/document.repo', () => {
        return {
            DocumentRepo: jest.fn().mockImplementation(() => {
                return {
                    findAll: jest.fn().mockImplementation(() => {
                        return [
                            {
                                id: '4564645',
                                merchantId: '5756757',
                                filename: 'test.png'
                            },
                            {
                                id: '123123123',
                                merchantId: '807087089',
                                filename: 'hello.jpg'
                            }
                        ];
                    })
                };
            })
        };
    });

    const { DocumentService } = require('../../business-logic/document.service');

    // Act
    const docs = await new DocumentService({}).findAll('merchant', '4645646456');

    // Assert
    expect(docs.length).toBe(2);
});
