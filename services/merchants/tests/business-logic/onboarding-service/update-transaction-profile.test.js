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

test('[UpdateTransactionProfile] merchant not found -> returns null', async () => {
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
    const result = await onboardingService.UpdateTransactionProfile('123', {});

    // Assert
    expect(result).toBeNull();
});

test('[UpdateTransactionProfile] entities are saved', async () => {
    // Assert
    jest.mock('../../../../../libs/repo/merchant.repo', () => {
        const merchant = {
            id: '52523241'
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
    jest.mock('../../../../../libs/repo/transaction-profile.repo', () => {
        return {
            TransactionProfileRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return undefined;
                    }),
                    save: jest.fn().mockImplementation(() => {
                        return true;
                    })
                };
            })
        };
    });
    const { OnboardingService } = require('../../../business-logic/onboarding.service');
    const onboardingService = new OnboardingService();

    // Act
    const result = await onboardingService.UpdateTransactionProfile('213123', {
        transactionProfileData: {
            goods: 234
        }
    });

    // Assert
    expect(result).not.toBeNull();
});

test('[UpdateTransactionProfile] entities are updated', async () => {
    // Assert
    jest.mock('../../../../../libs/repo/merchant.repo', () => {
        const merchant = {
            id: '52523241'
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
    jest.mock('../../../../../libs/repo/transaction-profile.repo', () => {
        return {
            TransactionProfileRepo: jest.fn().mockImplementation(() => {
                const updatedMerchat = {
                    id: '1233341',
                    merchant_id: '213123',
                    goods: 23
                };
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return updatedMerchat;
                    }),
                    update: jest.fn().mockImplementation(() => {
                        return updatedMerchat;
                    })
                };
            })
        };
    });
    const { OnboardingService } = require('../../../business-logic/onboarding.service');
    const onboardingService = new OnboardingService();

    // Act
    const result = await onboardingService.UpdateTransactionProfile('213123', {
        goods: 234
    });

    // Assert
    expect(result).not.toBeNull();
});
