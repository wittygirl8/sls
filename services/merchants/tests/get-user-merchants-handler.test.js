const { response } = require('../../../layers/helper_lib/src');
const { RequestBody } = require('../../../test-helpers/__mocks__');

beforeEach(() => {
    jest.resetModules();
});
jest.mock('../../../layers/helper_lib/src/token-decoder', () => {
    return {
        getUserId: () => 'WwwuYAbZa6vN8smhNM-I8'
    };
});

test('[ getUserMerchants] no merchants associated with user -> 200 with empty body is returned', async () => {
    // Assert
    jest.mock('../business-logic/merchant.service', () => {
        return {
            MerchantService: jest.fn().mockImplementation(() => {
                return {
                    getUserMerchants: () => [],
                    countOfTermsAndConditionForMerchant: () => {
                        return {};
                    },
                    getUploadedDocStatus: () => {
                        return {};
                    }
                };
            })
        };
    });
    jest.mock('../business-logic/referal-data.service', () => {
        return {
            RefferalDataService: jest.fn().mockImplementation(() => {
                return {
                    getReferralDataString: () => null
                };
            })
        };
    });

    const expectedResponse = response(
        { merchantsDto: [], referralDataString: null, InCompleteOnboardingMerchants: null },
        200
    );
    const { getUserMerchants } = require('../functions/get-user-merchants-handler');

    // Act
    const result = await getUserMerchants(RequestBody.merchantRequestBody);

    // Assert
    expect(result).toMatchObject(expectedResponse);
});

test('[ getUserMerchants] merchants associated with user-> entity is returned', async () => {
    // Assert
    jest.mock('../business-logic/merchant.service', () => {
        const userMerchants = [
            {
                id: '6693410635864080384',
                name: 'Test Merchant',
                Relationships: [
                    {
                        id: '6693410635885051904',
                        merchantId: '6693410635864080384',
                        Role: {
                            id: '6692332455971520512',
                            name: 'Owner'
                        }
                    }
                ],
                MerchantProductRequireds: [
                    {
                        id: '6701402290114265088',
                        productRequiredId: '6701397047943102468',
                        ProductRequired: {
                            id: '6701397047943102468',
                            name: 'Card Machine'
                        }
                    }
                ]
            },
            {
                id: '6701501488016916480',
                name: 'Test1',
                Relationships: [
                    {
                        id: '6701501488247603200',
                        merchantId: '6701501488016916480',
                        Role: {
                            id: '6692332451529752576',
                            name: 'User'
                        }
                    }
                ],
                MerchantProductRequireds: []
            }
        ];
        return {
            MerchantService: jest.fn().mockImplementation(() => {
                return {
                    getUserMerchants: jest.fn().mockImplementation(() => {
                        return userMerchants;
                    }),
                    countOfTermsAndConditionForMerchant: () => {
                        return {};
                    },
                    getUploadedDocStatus: () => {
                        return {};
                    }
                };
            })
        };
    });

    jest.mock('../business-logic/referal-data.service', () => {
        return {
            RefferalDataService: jest.fn().mockImplementation(() => {
                return {
                    getReferralDataString: () => null
                };
            })
        };
    });

    const { getUserMerchants } = require('../functions/get-user-merchants-handler');

    // Act
    const result = await getUserMerchants(RequestBody.merchantRequestBody);

    // Assert
    expect(result.statusCode).toBe(200);
    const entity = JSON.parse(result.body);
    expect(entity).not.toBeNull();
});

test('[ getUserMerchants] error is thrown -> 500 is returned', async () => {
    // Assert
    jest.mock('../business-logic/merchant.service', () => {
        return {
            MerchantService: jest.fn().mockImplementation(() => {
                return {
                    getUserMerchants: () => {
                        throw 'Error';
                    }
                };
            })
        };
    });
    jest.mock('../business-logic/referal-data.service', () => {
        return {
            RefferalDataService: jest.fn().mockImplementation(() => {
                return {
                    getReferralDataString: () => null
                };
            })
        };
    });
    jest.mock('../business-logic/merchant.service', () => {
        return {
            MerchantService: jest.fn().mockImplementation(() => {
                return {
                    countOfTermsAndConditionForMerchant: () => {},
                    getUploadedDocStatus: () => {}
                };
            })
        };
    });

    const { getUserMerchants } = require('../functions/get-user-merchants-handler');

    // Act
    const result = await getUserMerchants(RequestBody.merchantRequestBody);

    // Assert
    expect(result.statusCode).toBe(500);
});
