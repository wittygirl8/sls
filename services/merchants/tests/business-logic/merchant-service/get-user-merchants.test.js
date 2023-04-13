beforeEach(() => {
    jest.resetModules();

    jest.mock('../../../../../layers/models_lib/src', () => {
        const { SequelizeMock } = require('../../../../../test-helpers/__mocks__');
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

test('[ getUserMerchants] returns correct entity', async () => {
    //Arrange
    jest.mock('../../../../../libs/repo/merchant.repo', () => {
        return {
            MerchantRepo: jest.fn().mockImplementation(() => {
                return {
                    findAll: jest.fn().mockImplementation(() => {
                        return {
                            name: 'Merchant'
                        };
                    })
                };
            })
        };
    });
    const { MerchantService } = require('../../../business-logic/merchant.service');
    const merchantService = new MerchantService();

    // Act
    const result = await merchantService.getUserMerchants('123');

    // Assert
    expect(result.name).toBe('Merchant');
});

test('[ getUserMerchants] repositry throws an error', async () => {
    //Arrange
    jest.mock('../../../../../libs/repo/merchant.repo', () => {
        return {
            MerchantRepo: jest.fn().mockImplementation(() => {
                return {
                    findAll: jest.fn().mockImplementation(() => {
                        throw 'Error';
                    })
                };
            })
        };
    });
    const { MerchantService } = require('../../../business-logic/merchant.service');
    const merchantService = new MerchantService();

    // Act
    try {
        await merchantService.getUserMerchants('123');
    } catch (error) {
        expect(error).toBe('Error');
    }
});
