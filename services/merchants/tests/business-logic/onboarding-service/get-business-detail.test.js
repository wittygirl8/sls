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

test('[GetBusinessDetail] entity does not exist -> returns null', async () => {
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
    const result = await onboardingService.GetBusinessDetail('6456456');

    // Assert
    expect(result).toBe(null);
});

test('[GetBusinessDetail] businessDetail for entity does not exist -> returns empty employee number', async () => {
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

    jest.mock('../../../../../libs/repo/business-detail.repo', () => {
        return {
            BusinessDetailRepo: jest.fn().mockImplementation(() => {
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
    const result = await onboardingService.GetBusinessDetail('6456456');

    // Assert
    expect(result).not.toBe(null);
    expect(result.employeeIdNumber).toBe('');
});

test('[GetBusinessDetail] entities are fetched', async () => {
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

    jest.mock('../../../../../libs/repo/business-detail.repo', () => {
        return {
            BusinessDetailRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return {
                            vatNumber: '35346456'
                        };
                    })
                };
            })
        };
    });
    const { OnboardingService } = require('../../../business-logic/onboarding.service');
    const onboardingService = new OnboardingService();

    // Act
    const result = await onboardingService.GetBusinessDetail('6456456');

    // Assert
    expect(result).not.toBeNull();
    expect(result.vatNumber).toBe('35346456');
});
