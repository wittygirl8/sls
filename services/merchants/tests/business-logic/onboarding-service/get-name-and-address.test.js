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

test('[GetNameAndAddress] entity does not exist -> return null', async () => {
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
    const result = await onboardingService.GetNameAndAddress('123');

    // Assert
    expect(result).toBe(null);
});

test('[GetNameAndAddress]business details does not exist and merchant has not a legal name -> return null', async () => {
    //Arrange
    jest.mock('../../../../../libs/repo/merchant.repo', () => {
        return {
            MerchantRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return {
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
    const result = await onboardingService.GetNameAndAddress('123');

    // Assert
    expect(result).toBe(null);
});

test('[GetNameAndAddress] business details does not exist and merchant has a legal name -> return legalname', async () => {
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
    const result = await onboardingService.GetNameAndAddress('123');

    // Assert
    expect(result.legalName).toBe('Test name');
});

test('[GetNameAndAddress]business details exist, but address does not exist and merchant has not a legal name -> return null', async () => {
    //Arrange
    jest.mock('../../../../../libs/repo/merchant.repo', () => {
        return {
            MerchantRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return {
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
                            registeredNumber: '7777'
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
                        return undefined;
                    })
                };
            })
        };
    });
    const { OnboardingService } = require('../../../business-logic/onboarding.service');
    const onboardingService = new OnboardingService();

    // Act
    const result = await onboardingService.GetNameAndAddress('123');

    // Assert
    expect(result).toBe(null);
});

test('[GetNameAndAddress] business details exist, but address does not exist and merchant has a legal name -> return legalname', async () => {
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
    jest.mock('../../../../../libs/repo/business-detail.repo', () => {
        return {
            BusinessDetailRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return {
                            registeredNumber: '7777'
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
                        return undefined;
                    })
                };
            })
        };
    });
    const { OnboardingService } = require('../../../business-logic/onboarding.service');
    const onboardingService = new OnboardingService();

    // Act
    const result = await onboardingService.GetNameAndAddress('123');

    // Assert
    expect(result.legalName).toBe('Test name');
});

test('[GetNameAndAddress] entities are fetched', async () => {
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
                            phoneNumber: '+3123',
                            postCode: 'ABC'
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
                            registeredNumber: '7777'
                        };
                    })
                };
            })
        };
    });
    const { OnboardingService } = require('../../../business-logic/onboarding.service');
    const onboardingService = new OnboardingService();

    // Act
    const result = await onboardingService.GetNameAndAddress('123');

    // Assert
    expect(result).not.toBeNull();
    expect(result.legalName).toBe('Test name');
    // expect(result.phoneNumber).toBe('+3123');
    expect(result.postCode).toBe('ABC');
});
