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

test('[getBusinessDetails] returns valid object', async () => {
    //Arrange
    jest.mock('../../../../../libs/repo/merchant.repo', () => {
        return {
            MerchantRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return {
                            legalName: 'test merchant',
                            baseAddressId: 2131,
                            tradingAddressId: 412312,
                            primaryOwnerId: 2312
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
                            city: 'Berlin'
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
                            fullName: 'John John',
                            owner_address_id: 4312
                        };
                    })
                };
            })
        };
    });
    const { BusinessDetailsService } = require('../../../business-logic/business-details.service');
    const businessDetailsService = new BusinessDetailsService();

    // Act
    const result = await businessDetailsService.getBusinessDetails(4123);

    // Assert
    expect(result.businessDetails.legalName).toBe('test merchant');
    expect(result.ownerDetails.fullName).toBe('John John');
});

test('[getBusinessDetails] merchant not found -> returns null', async () => {
    jest.mock('../../../../../libs/repo/merchant.repo', () => {
        return {
            MerchantRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return null;
                    })
                };
            })
        };
    });
    const { BusinessDetailsService } = require('../../../business-logic/business-details.service');
    const businessDetailsService = new BusinessDetailsService();

    // Act
    const result = await businessDetailsService.getBusinessDetails(4123);

    // Assert
    expect(result).toBeNull();
});
