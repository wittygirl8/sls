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

test('[GetProductsRequired] entities are saved', async () => {
    // Assert
    jest.mock('../../../../../libs/repo/merchant-product-required.repo', () => {
        const merchantProductRequired = {
            id: '1',
            merchantId: '321432432',
            productRequiredId: '545432543'
        };

        return {
            MerchantProductRequiredRepo: jest.fn().mockImplementation(() => {
                return {
                    findAll: jest.fn().mockImplementation(() => {
                        return [merchantProductRequired];
                    }),
                };
            })
        };
    });
    const { OnboardingService } = require('../../../business-logic/onboarding.service');
    const onboardingService = new OnboardingService();

    // Act
    const result = await onboardingService.GetProductsRequired('184165');

    // Assert
    expect(result).not.toBeNull();
});
