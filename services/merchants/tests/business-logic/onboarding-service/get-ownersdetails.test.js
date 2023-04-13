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

test('[GetOwnerDetailsAndAddress] entity does not exist -> returns null', async () => {
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
    const result = await onboardingService.GetOwnerDetailsAndAddress('123');

    // Assert
    expect(result).toBe(null);
});

test('[GetOwnerDetailsAndAddress] ownersdetails does not exist -> return null', async () => {
    //Arrange
    jest.mock('../../../../../libs/repo/merchant.repo', () => {
        return {
            MerchantRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return {
                            legalName: 'Test name',
                            onboardingStep: '4'
                        };
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
                        return undefined;
                    })
                };
            })
        };
    });
    const { OnboardingService } = require('../../../business-logic/onboarding.service');
    const onboardingService = new OnboardingService();

    // Act
    const result = await onboardingService.GetOwnerDetailsAndAddress('123');

    // Assert
    expect(result).not.toBe(null);
    expect(result.ssnLastDigits).toBe('');
});

test('[GetOwnerDetailsAndAddress] entities are fetched', async () => {
    // Assert
    jest.mock('../../../../../libs/repo/merchant.repo', () => {
        return {
            MerchantRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return {
                            legalName: 'Test name',
                            onboardingStep: '4'
                        };
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
    const { OnboardingService } = require('../../../business-logic/onboarding.service');
    const onboardingService = new OnboardingService();

    // Act
    const result = await onboardingService.GetOwnerDetailsAndAddress('123');

    // Assert
    expect(result).not.toBeNull();
    expect(result.ownersDetails.fullName).toBe('Angelina Podolski');
    expect(result.addressData.postCode).toBe('ABC');
});
