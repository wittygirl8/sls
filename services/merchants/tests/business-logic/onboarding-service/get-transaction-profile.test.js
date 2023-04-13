beforeEach(() => {
    jest.resetModules();
});

test('[GetTransactionProfile] entity does not exist -> return null', async () => {
    //Arrange
    jest.mock('../../../../../libs/repo/merchant.repo', () => {
        return {
            MerchantRepo: jest.fn().mockImplementation(() => {})
        };
    });
    jest.mock('../../../../../libs/repo/transaction-profile.repo.js', () => {
        return {
            TransactionProfileRepo: jest.fn().mockImplementation(() => {
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
    const result = await onboardingService.GetTransactionProfile('123');

    // Assert
    expect(result).toBe(null);
});

test('[GetTransactionProfile] entities are fetched', async () => {
    // Assert
    jest.mock('../../../../../libs/repo/merchant.repo', () => {
        return {
            MerchantRepo: jest.fn().mockImplementation(() => {})
        };
    });
    jest.mock('../../../../../libs/repo/transaction-profile.repo', () => {
        return {
            TransactionProfileRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return {
                            id: '1233341',
                            merchant_id: '213123'
                        };
                    })
                };
            })
        };
    });

    const { OnboardingService } = require('../../../business-logic/onboarding.service');
    const onboardingService = new OnboardingService();

    // Act
    const result = await onboardingService.GetTransactionProfile('213123');

    // Assert
    expect(result).not.toBeNull();
    expect(result.merchant_id).toBe('213123');
});
