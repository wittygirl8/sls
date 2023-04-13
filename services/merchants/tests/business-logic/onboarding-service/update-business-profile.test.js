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

test('[UpdateBusinessProfile] merchant not found -> returns null', async () => {
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
    const result = await onboardingService.UpdateBusinessProfile('123', {});

    // Assert
    expect(result).toBeNull();
});

test('[UpdateBusinessProfile] entities are saved', async () => {
    // Assert
    jest.mock('../../../../../libs/repo/merchant.repo', () => {
        const merchant = {
            legalName: 'TestName',
            onboardingStep: 5
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
    jest.mock('../../../../../libs/repo/business-profile.repo', () => {
        return {
            BusinessProfileRepo: jest.fn().mockImplementation(() => {
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
    const { OnboardingService } = require('../../../business-logic/onboarding.service');
    const onboardingService = new OnboardingService();

    // Act
    const result = await onboardingService.UpdateBusinessProfile('123', { 
        stockLocation: 'stock', 
        isStockSufficient: true,
        productDescriptions: ['5453423', '4341323'],
        businessDescriptions: ['543413', '55432']
     });

    // Assert
    expect(result).not.toBeNull();
});

test('[UpdateBusinessProfile] entities are saved', async () => {
    // Assert
    jest.mock('../../../../../libs/repo/merchant.repo', () => {
        const merchant = {
            legalName: 'TestName',
            onboardingStep: 5
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
    jest.mock('../../../../../libs/repo/business-profile.repo', () => {
        return {
            BusinessProfileRepo: jest.fn().mockImplementation(() => {
                const bubinessProfile = {
                    merchantId: '228919161',
                };

                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return bubinessProfile;
                    }),
                    update: jest.fn().mockImplementation(() => {
                        return true;
                    })
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
    const { OnboardingService } = require('../../../business-logic/onboarding.service');
    const onboardingService = new OnboardingService();

    // Act
    const result = await onboardingService.UpdateBusinessProfile('123', { 
        stockLocation: 'stock', 
        isStockSufficient: true,
        productDescriptions: ['5453423', '4341323'],
        businessDescriptions: ['543413', '55432']
     });
    // Assert
    expect(result).not.toBeNull();
});