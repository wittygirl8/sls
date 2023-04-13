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

test('[UpdateOwnerDetails] merchant not found -> returns null', async () => {
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
    const result = await onboardingService.UpdateOwnerDetails('123', {});

    // Assert
    expect(result).toBeNull();
});

test('[UpdateOwnerDetails] entities are saved', async () => {
    // Assert
    jest.mock('../../../../../libs/repo/merchant.repo', () => {
        const merchant = {
            postCode: 'Test34123',
            onboardingStep: 4
        };

        return {
            MerchantRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return merchant;
                    }),
                    update: jest.fn().mockImplementation(() => {
                        return true;
                    })
                };
            })
        };
    });
    jest.mock('../../../../../libs/repo/ownerdetails.repo', () => {
        return {
            OwnersDetailsRepo: jest.fn().mockImplementation(() => {
                return {
                    save: jest.fn().mockImplementation(() => {
                        return true;
                    }),
                    findOne: jest.fn().mockImplementation(() => {
                        return true;
                    })
                };
            })
        };
    });
    const { OnboardingService } = require('../../../business-logic/onboarding.service');
    const onboardingService = new OnboardingService();

    // Act
    const result = await onboardingService.UpdateOwnerDetails('123', {
        ownersDetails: {
            fullName: 'Angelina Podolski',
            dateOfBirth: '1990-01-01T00:00:00'
        }
    });

    // Assert
    expect(result).not.toBeNull();
});

test('[UpdateOwnerDetails] entities are updated', async () => {
    // Assert
    jest.mock('../../../../../libs/repo/merchant.repo', () => {
        const merchant = {
            postCode: 'Test34123',
            onboardingStep: 4,
            primaryOwnerId: '58248264'
        };

        return {
            MerchantRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return merchant;
                    }),
                    update: jest.fn().mockImplementation(() => {
                        return true;
                    })
                };
            })
        };
    });
    jest.mock('../../../../../libs/repo/ownerdetails.repo', () => {
        return {
            OwnersDetailsRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return {
                            fullName: 'Angelina Podolski'
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
    const result = await onboardingService.UpdateOwnerDetails('123', {
        ownersDetails: {
            fullName: 'Angelina Podolski',
            dateOfBirth: '1990-01-01T00:00:00'
        }
    });

    // Assert
    expect(result).not.toBeNull();
});
