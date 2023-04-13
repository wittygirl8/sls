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

test('[GetBusinessProfile] businessProfile does not exist -> return null', async () => {
    // Assert
    jest.mock('../../../../../libs/repo/business-profile.repo', () => {
        return {
            BusinessProfileRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return undefined;
                    }),
                };
            })
        };
    });
    const { OnboardingService } = require('../../../business-logic/onboarding.service');
    const onboardingService = new OnboardingService();

    // Act
    const result = await onboardingService.GetBusinessProfile('6456456');

    // Assert
    expect(result).toBe(null);
});

test('[GetBusinessProfile] entities are fetched', async () => {
    // Assert
    jest.mock('../../../../../libs/repo/business-profile.repo', () => {
        return {
            BusinessProfileRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return {
                            merchantId: '228919161',
                        };
                    }),
                };
            })
        };
    });
    jest.mock('../../../../../libs/repo/merchant-product-description.repo', () => {
        return {
            MerchantProductDescriptionRepo: jest.fn().mockImplementation(() => {
                const products = [
                    {
                        merchantId: '123456',
                        productDescriptionId: '654321',
                    },
                    {
                        merchantId: '123457',
                        productDescriptionId: '654322',
                    },
                    {
                        merchantId: '123458',
                        productDescriptionId: '654323',
                    }
                ]
                return {
                    findAll: jest.fn().mockImplementation(() => {
                        return products;
                    }),
                };
            })
        };
    });
    jest.mock('../../../../../libs/repo/merchant-business-description.repo', () => {
        return {
            MerchantBusinessDescriptionRepo: jest.fn().mockImplementation(() => {
                const businesses = [
                    {
                        merchantId: '123456',
                        businessDescriptionId: '654321',
                    },
                    {
                        merchantId: '123457',
                        businessDescriptionId: '654322',
                    },
                    {
                        merchantId: '123458',
                        businessDescriptionId: '654323',
                    }
                ]
                return {
                    findAll: jest.fn().mockImplementation(() => {
                        return businesses;
                    }),
                };
            })
        };
    });
    const { OnboardingService } = require('../../../business-logic/onboarding.service');
    const onboardingService = new OnboardingService();

    // Act
    const result = await onboardingService.GetBusinessProfile('6456456');

    // Assert
    expect(result).not.toBeNull();
    expect(result.merchantId).toBe('228919161');
});