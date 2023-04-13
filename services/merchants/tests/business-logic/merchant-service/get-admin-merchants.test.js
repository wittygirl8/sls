beforeEach(() => {
    jest.resetModules();

    jest.mock('../../../../../layers/models_lib/src', () => {
        const { SequelizeMock } = require('../../../../../test-helpers/__mocks__');
        const { AddressMock } = require('../../../../../test-helpers/__mocks__');
        return {
            connectDB: () => ({
                sequelize: SequelizeMock.sequelize,
                Sequelize: {
                    Op: {}
                },
                AddressModel: AddressMock.AddressModel
            })
        };
    });
});

test('[ getAdminMerchants] returns correct entity', async () => {
    //Arrange
    jest.mock('../../../../../libs/repo/merchant.repo', () => {
        return {
            MerchantRepo: jest.fn().mockImplementation(() => {
                return {
                    findAll: jest.fn().mockImplementation(() => {
                        const merchantArr = [
                            {
                                name: 'Merchant',
                                MerchantProductRequireds: [],
                                BaseAddress: {
                                    postCode: '4FGE YU'
                                }
                            }
                        ];
                        return merchantArr;
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
                        const address = {
                            city: 'Merchant',
                            postCode: '3434444'
                        };

                        return address;
                    })
                };
            })
        };
    });

    const { MerchantService } = require('../../../business-logic/merchant.service');
    const merchantService = new MerchantService();

    // Act
    const result = await merchantService.getAdminMerchants(1, 'name');

    // Assert
    expect(result[0].name).toBe('Merchant');
});

test('[ getAdminMerchants] repositry throws an error', async () => {
    //Arrange
    jest.mock('../../../../../libs/repo/merchant.repo', () => {
        return {
            MerchantRepo: jest.fn().mockImplementation(() => {
                return {
                    findAll: jest.fn().mockImplementation(() => {
                        throw 'Error';
                    })
                };
            })
        };
    });
    const { MerchantService } = require('../../../business-logic/merchant.service');
    const merchantService = new MerchantService();

    // Act
    try {
        await merchantService.getAdminMerchants(1, 'name');
    } catch (error) {
        expect(error).toBe('Error');
    }
});
