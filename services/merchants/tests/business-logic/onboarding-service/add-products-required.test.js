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

test('[AddProductsRequired] merchant not found -> returns null', async () => {
    //Arrange
    jest.mock('../../../../../libs/repo/merchant.repo', () => {
        return {
            MerchantRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return undefined;
                    })
                };
            })
        };
    });
    const { OnboardingService } = require('../../../business-logic/onboarding.service');
    const onboardingService = new OnboardingService();

    // Act
    const result = await onboardingService.AddProductsRequired('123', {});

    // Assert
    expect(result).toBeNull();
});

test('[AddProductsRequired] entities are saved', async () => {
    // Assert
    jest.mock('../../../../../libs/repo/merchant-product-required.repo', () => {
        const merchantProductRequired = {
            id: '1',
            merchantId: '23',
            productRequiredId: '3'
        };

        return {
            MerchantProductRequiredRepo: jest.fn().mockImplementation(() => {
                return {
                    findAll: jest.fn().mockImplementation(() => {
                        return [merchantProductRequired];
                    }),
                    save: jest.fn().mockImplementation(() => {
                        return true;
                    }),
                    deleteAll: jest.fn().mockImplementation(() => {
                        return true;
                    })
                };
            })
        };
    });
    jest.mock('../../../../../libs/repo/merchant.repo', () => {
        return {
            MerchantRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return {
                            id: '1',
                            name: 'Test Merchant'
                        };
                    }),
                    update: jest.fn().mockImplementation(() => {
                        return true;
                    })
                };
            })
        };
    });
    const { OnboardingService } = require('../../../business-logic/onboarding.service');
    const onboardingService = new OnboardingService();

    // Act
    const result = await onboardingService.AddProductsRequired('1', { productsRequiredIds: ['2', '3'], resellerId: 1 });

    // Assert
    expect(result).not.toBeNull();
    expect(result.name).toBe('Test Merchant');
    expect(result.id).toBe('1');
});
