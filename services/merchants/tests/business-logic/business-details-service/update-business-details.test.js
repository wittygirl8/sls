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

test('[updateBusinessDetails] entities updated successfully', async () => {
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
                    findOne: jest.fn().mockImplementation(() => {
                        return {
                            city: 'Berlin'
                        };
                    }),
                    update: jest.fn().mockImplementation(() => {
                        return true;
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
                            ownerAddressId: 4312
                        };
                    }),
                    update: jest.fn().mockImplementation(() => {
                        return true;
                    })
                };
            })
        };
    });
    const { BusinessDetailsService } = require('../../../business-logic/business-details.service');
    const businessDetailsService = new BusinessDetailsService();

    // Act
    const result = await businessDetailsService.updateBusinessDetails(4123, {
        businessDetails: {
            legalName: 'test'
        },
        ownerDetails: {
            fullName: 'Test Test'
        }
    });

    // Assert
    expect(result).not.toBeNull();
});

test('[updateBusinessDetails] merchant not found -> returns null', async () => {
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
    const result = await businessDetailsService.updateBusinessDetails(4123);

    // Assert
    expect(result).toBeNull();
});
