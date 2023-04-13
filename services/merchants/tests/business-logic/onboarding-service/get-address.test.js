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

test('[GetTradingAndAddress] entity does not exist -> return null', async () => {
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
    const result = await onboardingService.GetTradingAndAddress('123');

    // Assert
    expect(result).toBe(null);
});

test('[GetTradingAndAddress] address does not exist -> return null', async () => {
    //Arrange
    jest.mock('../../../../../libs/repo/merchant.repo', () => {
        return {
            MerchantRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return {
                            legalName: 'Test name',
                            onboardingStep: '3'
                        };
                    })
                };
            })
        };
    });

    jest.mock('../../../../../libs/repo/address.repo', () => {
        return {
            AddressRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return null;
                    })
                };
            })
        };
    });
    jest.mock('../../../../../libs/repo/business-bank-details.repo', () => {
        return {
            BusinessBankDetailsRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return null;
                    })
                };
            })
        };
    });
    const { OnboardingService } = require('../../../business-logic/onboarding.service');
    const onboardingService = new OnboardingService();

    // Act
    const result = await onboardingService.GetTradingAndAddress('123');

    // Assert
    expect(result).toBe(null);
});

test('[GetTradingAndAddress] entities are fetched', async () => {
    // Assert
    jest.mock('../../../../../libs/repo/merchant.repo', () => {
        return {
            MerchantRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return {
                            legalName: 'Test name',
                            onboardingStep: '3'
                        };
                    })
                };
            })
        };
    });

    jest.mock('../../../../../libs/repo/address.repo', () => {
        return {
            AddressRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return {
                            postCode: 'ABC'
                        };
                    })
                };
            })
        };
    });
    jest.mock('../../../../../libs/repo/business-bank-details.repo', () => {
        return {
            BusinessBankDetailsRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return {
                            sortCode: '12345'
                        };
                    })
                };
            })
        };
    });
    const { OnboardingService } = require('../../../business-logic/onboarding.service');
    const onboardingService = new OnboardingService();

    // Act
    const result = await onboardingService.GetTradingAndAddress('123');

    // Assert
    expect(result).not.toBeNull();
    expect(result.postCode).toBe('ABC');
});
