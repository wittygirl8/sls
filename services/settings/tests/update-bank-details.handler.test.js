beforeEach(() => {
    jest.resetModules();

    jest.doMock('../../../layers/models_lib/src', () => {
        const { SequelizeMock, BankDetailsChangeLogMock } = require('../../../test-helpers/__mocks__');
        return {
            connectDB: () => ({
                BankDetailsChangeLog: BankDetailsChangeLogMock.BankDetailsChangeLogModel,
                sequelize: SequelizeMock.sequelize,
                Sequelize: {
                    Op: {}
                }
            })
        };
    });
});

test('[updateBankDetails] merchant not found -> returns null', async () => {
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
    jest.mock('../../../libs/repo/bank_details_update_requests.repo', () => {
        //We need test case refining
        return {
            BankDetailsUpdateRequestRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return { newAccountNumber: '00000' };
                    }),
                    update: jest.fn().mockImplementation(() => {
                        return null;
                    })
                };
            })
        };
    });
    jest.mock('../../../libs/repo/acquirer-account-configuration-repo', () => {
        //We need test case refining
        return {
            AcquirerAccountConfigurationRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return null;
                    })
                };
            })
        };
    });
    const { BankService } = require('../business-logic/bank.service');
    const bankService = new BankService();

    // Act
    const result = await bankService.UpdateBankDetails('123', {});

    // Assert
    expect(result).toBeNull();
});

test('[updateBankDetails] entities are updated', async () => {
    // Assert
    jest.mock('../../../libs/repo/merchant.repo', () => {
        const merchant = {
            businessBankDetailsId: '34236236236236236'
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
    jest.mock('../../../libs/repo/acquirer-account-configuration-repo', () => {
        //We need test case refining
        return {
            AcquirerAccountConfigurationRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return null;
                    })
                };
            })
        };
    });
    jest.mock('../../../libs/repo/business-bank-details.repo', () => {
        const businessBankDetails = {
            newAccountNumber: '12345678'
        };
        return {
            BusinessBankDetailsRepo: jest.fn().mockImplementation(() => {
                return {
                    update: jest.fn().mockImplementation(() => {
                        return true;
                    }),
                    findOne: jest.fn().mockImplementation(() => {
                        return businessBankDetails;
                    })
                };
            })
        };
    });
    jest.mock('../../../libs/repo/document.repo', () => {
        const documentDetails = {
            is: '98797979'
        };
        return {
            DocumentRepo: jest.fn().mockImplementation(() => {
                return {
                    findAll: jest.fn().mockImplementation(() => {
                        return documentDetails;
                    }),
                    updateAll: jest.fn().mockImplementation(() => {
                        return true;
                    }),
                    update: jest.fn().mockImplementation(() => {
                        return true;
                    }),
                    findOne: jest.fn().mockImplementation(() => {
                        return documentDetails;
                    })
                };
            })
        };
    });

    jest.mock('../../../layers/helper_lib/src', () => {
        return {
            auditLogsPublisher: jest.fn().mockImplementation(() => {
                return null;
            })
        };
    });

    const { BankService } = require('../business-logic/bank.service');
    const bankService = new BankService();

    const result = await bankService.UpdateBankDetails(
        '123',
        {
            sortCode: '123456',
            new_account_number: '87654322',
            accountHolderName: 'Jane'
        },
        '123'
    );

    // Assert
    expect(result).not.toBeNull();
});
