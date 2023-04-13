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

test('[UpdateTradingAddress] merchant not found -> returns null', async () => {
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
    const result = await onboardingService.UpdateTradingAddress('123', {});

    // Assert
    expect(result).toBeNull();
});

test('[UpdateTradingAddress] entities are saved', async () => {
    // Assert
    jest.mock('../../../../../libs/repo/merchant.repo', () => {
        const merchant = {
            postCode: 'Test34123',
            onboardingStep: 3
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
    jest.mock('../../../../../libs/repo/business-bank-details.repo', () => {
        return {
            BusinessBankDetailsRepo: jest.fn().mockImplementation(() => {
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
    jest.mock('../../../../../libs/repo/adyen-merchant-metadata-repo', () => {
        return {
            AdyenMerchantMetadataRepo: jest.fn().mockImplementation(() => {
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
    const result = await onboardingService.UpdateTradingAddress('123', { postCode: '34123', addressLine1: '1234' });

    // Assert
    expect(result).not.toBeNull();
});

test('[UpdateTradingAddress] entities are saved', async () => {
    // Assert
    jest.mock('../../../../../libs/repo/merchant.repo', () => {
        const merchant = {
            postCode: 'Test34123',
            onboardingStep: 3
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
    jest.mock('../../../../../libs/repo/business-bank-details.repo', () => {
        return {
            BusinessBankDetailsRepo: jest.fn().mockImplementation(() => {
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
    const result = await onboardingService.UpdateTradingAddress('123', { postCode: '34123', addressLine1: '1234' });

    // Assert
    expect(result).not.toBeNull();
});

test('[UpdateTradingAddress] entities are updated', async () => {
    // Assert
    jest.mock('../../../../../libs/repo/merchant.repo', () => {
        const merchant = {
            postCode: 'Test34123',
            onboardingStep: 3,
            tradingAddressId: '516515615',
            businessBankDetailsId: '4543543543'
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
    jest.mock('../../../../../libs/repo/business-bank-details.repo', () => {
        return {
            BusinessBankDetailsRepo: jest.fn().mockImplementation(() => {
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
    jest.mock('../../../../../libs/repo/adyen-merchant-metadata-repo', () => {
        return {
            AdyenMerchantMetadataRepo: jest.fn().mockImplementation(() => {
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
    const result = await onboardingService.UpdateTradingAddress('123', { postCode: '34123', addressLine1: '1234' });

    // Assert
    expect(result).not.toBeNull();
});
