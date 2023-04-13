beforeEach(() => {
    jest.resetModules();

    jest.mock('../../../../../layers/models_lib/src', () => {
        const { SequelizeMock } = require('../../../../../test-helpers/__mocks__');
        return {
            connectDB: () => ({
                sequelize: SequelizeMock.sequelize
            })
        };
    });
});

test('[findByMerchantId] returns entity', async () => {
    //Arrange
    jest.mock('../../../../../libs/repo/external-merchant-ids-relationship.repo', () => {
        return {
            ExternalMerchantIdsRepo: jest.fn().mockImplementation(() => {
                return {
                    findByMerchantId: jest.fn().mockImplementation(() => {
                        return [
                            {
                                id: '99999',
                                merchantId: '7444458'
                            }
                        ];
                    })
                };
            })
        };
    });

    const { ExternalMerchantIdsService } = require('../../../business-logic/external-merchant-ids-relationship.service');
    const externalMerchantIdsService = new ExternalMerchantIdsService();

    // Act
    const result = await externalMerchantIdsService.findByMerchantId();

    // Assert
    expect(result.length).toBe(1);
});

test('[findByMerchantId] repository throws an error', async () => {
    //Arrange
    jest.mock('../../../../../libs/repo/external-merchant-ids-relationship.repo', () => {
        return {
            ExternalMerchantIdsRepo: jest.fn().mockImplementation(() => {
                return {
                    findByMerchantId: jest.fn().mockImplementation(() => {
                        throw 'Error';
                    })
                };
            })
        };
    });

    const { ExternalMerchantIdsService } = require('../../../business-logic/external-merchant-ids-relationship.service');
    const externalMerchantIdsService = new ExternalMerchantIdsService();

    // Act
    try {
        await externalMerchantIdsService.findByMerchantId();
    } catch (error) {
        expect(error).toBe('Error');
    }
});
