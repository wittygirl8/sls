beforeEach(() => {
    jest.resetModules();

    jest.mock('../../../layers/models_lib/src', () => {
        const { SequelizeMock } = require('../../../test-helpers/__mocks__');
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

test('[getBankDetails] entity does not exist -> return null', async () => {
    //Arrange
    jest.mock('../../../libs/repo/merchant.repo', () => {
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
    const { BankService } = require('../business-logic/bank.service');
    const bankService = new BankService();

    // Act
    const result = await bankService.GetBankDetails('123');

    // Assert
    expect(result).toBe(null);
});

test('[getBankDetails] bankDetails  does not exist -> return businessBankDetailsId', async () => {
    //Arrange
    jest.mock('../../../libs/repo/merchant.repo', () => {
        return {
            MerchantRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return {
                            businessBankDetailsId: '34236236236236236'
                        };
                    })
                };
            })
        };
    });

    jest.mock('../../../libs/repo/business-bank-details.repo', () => {
        return {
            BusinessBankDetailsRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return undefined;
                    })
                };
            })
        };
    });

    const { BankService } = require('../business-logic/bank.service');
    const bankService = new BankService();
    // Act
    const result = await bankService.GetBankDetails('123');

    // Assert
    expect(result.id).toBe(undefined);
});

test('[getBankDetails] entities are fetched', async () => {
    // Assert
    jest.mock('../../../libs/repo/merchant.repo', () => {
        return {
            MerchantRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return {
                            businessBankDetailsId: '34236236236236236'
                        };
                    })
                };
            })
        };
    });

    jest.mock('../../../libs/repo/business-bank-details.repo', () => {
        return {
            BusinessBankDetailsRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return {
                            id: '34236236236236236',
                            sortCode: 123412,
                            newAccountNumber: 42354324,
                            accountHolderName: 'John'
                        };
                    })
                };
            })
        };
    });

    const { BankService } = require('../business-logic/bank.service');
    const bankService = new BankService();
    // Act
    const result = await bankService.GetBankDetails('123');

    // Assert
    expect(result).not.toBeNull();
    expect(result.sortCode).toBe(123412);
    expect(result.newAccountNumber).toBe(42354324);
    expect(result.accountHolderName).toBe('John');
});
