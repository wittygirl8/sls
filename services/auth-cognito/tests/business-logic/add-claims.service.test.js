beforeEach(() => {
    jest.resetModules();

    jest.mock('../../../../layers/models_lib/src', () => {
        const { SequelizeMock } = require('../../../../test-helpers/__mocks__');
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

test('[AddClaims UserProvider Throws error]', async () => {
    //Arrange
    jest.mock('../../../../libs/repo/identity-provider-mypay-relations.repo.js', () => {
        return {
            IdentityProviderMypayRelationsRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        throw 'Error';
                    })
                };
            })
        };
    });

    const { AuthCognitoService } = require('../../business-logic/auth-cognito.service');
    const authCognitoService = new AuthCognitoService();

    // Act
    try {
        await authCognitoService.addClaims('58aaee5b-6b90-4b9f-8ada-81527d1eb06d');
    } catch (error) {
        // Assert
        expect(error).toBe('Error');
    }
});

test('[AddClaims Merchants Get throws error]', async () => {
    //Arrange
    jest.mock('../../../../libs/repo/identity-provider-mypay-relations.repo.js', () => {
        return {
            IdentityProviderMypayRelationsRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return {
                            userId: '45647656867789'
                        };
                    })
                };
            })
        };
    });
    jest.mock('../../../../libs/repo/merchant.repo.js', () => {
        return {
            MerchantRepo: jest.fn().mockImplementation(() => {
                return {
                    findAllOnlyId: jest.fn().mockImplementation(() => {
                        throw 'Error';
                    })
                };
            })
        };
    });

    const { AuthCognitoService } = require('../../business-logic/auth-cognito.service');
    const authCognitoService = new AuthCognitoService();

    // Act
    try {
        await authCognitoService.addClaims('58aaee5b-6b90-4b9f-8ada-81527d1eb06d');
    } catch (error) {
        // Assert
        expect(error).toBe('Error');
    }
});

test('[AddClaims Success]', async () => {
    //Arrange
    jest.mock('../../../../libs/repo/identity-provider-mypay-relations.repo.js', () => {
        return {
            IdentityProviderMypayRelationsRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return {
                            userId: '45647656867789'
                        };
                    })
                };
            })
        };
    });
    jest.mock('../../../../libs/repo/merchant.repo.js', () => {
        return {
            MerchantRepo: jest.fn().mockImplementation(() => {
                return {
                    findAllOnlyId: jest.fn().mockImplementation(() => {
                        return [
                            {
                                id: '6456456456'
                            },
                            {
                                id: '9870890870'
                            },
                            {
                                id: '1232314'
                            }
                        ];
                    })
                };
            })
        };
    });

    const { AuthCognitoService } = require('../../business-logic/auth-cognito.service');
    const authCognitoService = new AuthCognitoService();

    // Act
    const result = await authCognitoService.addClaims('58aaee5b-6b90-4b9f-8ada-81527d1eb06d');

    // Assert
    expect(result.myPayUserId).toBe('45647656867789');
    expect(result.merchants.length).toBe(3);
});
