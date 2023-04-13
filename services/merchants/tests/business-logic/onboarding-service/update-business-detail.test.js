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

test('[UpdateBusinessDetail] merchant not found -> returns null', async () => {
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
    jest.mock('../../../../../libs/repo/acquirer-account-configuration-repo', () => {
        return {
            AcquirerAccountConfigurationRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return {};
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
    const result = await onboardingService.UpdateBusinessDetail('870890', {});

    // Assert
    expect(result).toBeNull();
});

test('[UpdateBusinessDetail] entities are saved', async () => {
    // Assert
    jest.mock('../../../../../libs/repo/merchant.repo', () => {
        const merchant = {
            legalName: 'Legal',
            onboardingStep: 2
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
    jest.mock('../../../../../libs/repo/business-detail.repo', () => {
        return {
            BusinessDetailRepo: jest.fn().mockImplementation(() => {
                return {
                    save: jest.fn().mockImplementation(() => {
                        return true;
                    })
                };
            })
        };
    });
    jest.mock('../../../../../libs/repo/acquirer-account-configuration-repo', () => {
        return {
            AcquirerAccountConfigurationRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return {};
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
    const result = await onboardingService.UpdateBusinessDetail('57765', {
        vatNumber: '789789',
        website: 'sdfsdf.ru'
    });

    // Assert
    expect(result).not.toBeNull();
});

test('[UpdateBusinessDetail] entities are updated', async () => {
    // Assert
    jest.mock('../../../../../libs/repo/merchant.repo', () => {
        const merchant = {
            legalName: 'Legal',
            onboardingStep: 2,
            businessDetailId: '76483222'
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
    jest.mock('../../../../../libs/repo/business-detail.repo', () => {
        const businessDetails = {
            registeredNumber: '768697'
        };

        return {
            BusinessDetailRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return businessDetails;
                    }),
                    update: jest.fn().mockImplementation(() => {
                        return true;
                    })
                };
            })
        };
    });
    jest.mock('../../../../../libs/repo/acquirer-account-configuration-repo', () => {
        return {
            AcquirerAccountConfigurationRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return {};
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
    const result = await onboardingService.UpdateBusinessDetail('57765', {
        vatNumber: '789789',
        website: 'sdfsdf.ru'
    });

    // Assert
    expect(result).not.toBeNull();
});
