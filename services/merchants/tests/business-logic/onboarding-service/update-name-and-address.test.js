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

test('[UpdateNameAndAddress] merchant not found -> returns null', async () => {
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
    const result = await onboardingService.UpdateNameAndAddress('123', {});

    // Assert
    expect(result).toBeNull();
});

test('[UpdateNameAndAddress] entities are saved', async () => {
    // Assert
    jest.mock('../../../../../libs/repo/merchant.repo', () => {
        const merchant = {
            legalName: 'TestName',
            onboardingStep: 1
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
    jest.mock('../../../../../libs/repo/address.repo', () => {
        return {
            AddressRepo: jest.fn().mockImplementation(() => {
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
    jest.mock('../../../../../libs/repo/business-detail.repo', () => {
        return {
            BusinessDetailRepo: jest.fn().mockImplementation(() => {
                return {
                    save: jest.fn().mockImplementation(() => {
                        return true;
                    }),
                    findOne: jest.fn().mockImplementation(() => {
                        return {};
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
    const result = await onboardingService.UpdateNameAndAddress('123', { legalName: 'name', addressLine1: '1234' });

    // Assert
    expect(result).not.toBeNull();
});

test('[UpdateNameAndAddress] entities are updated', async () => {
    // Assert
    jest.mock('../../../../../libs/repo/merchant.repo', () => {
        const merchant = {
            legalName: 'TestName',
            onboardingStep: 1,
            baseAddressId: '516515615',
            businessDetailId: '86865849175'
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
    jest.mock('../../../../../libs/repo/address.repo', () => {
        return {
            AddressRepo: jest.fn().mockImplementation(() => {
                return {
                    update: jest.fn().mockImplementation(() => {
                        return true;
                    }),
                    findOne: jest.fn().mockImplementation(() => {
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
                    updateById: jest.fn().mockImplementation(() => {
                        return true;
                    }),
                    findOne: jest.fn().mockImplementation(() => {
                        return {};
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
    const result = await onboardingService.UpdateNameAndAddress('123', { legalName: 'name', addressLine1: '1234' });

    // Assert
    expect(result).not.toBeNull();
});
