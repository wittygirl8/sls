const { response } = require('../../../layers/helper_lib/src');
const { RequestBody } = require('../../../test-helpers/__mocks__');

beforeEach(() => {
    jest.resetModules();
});

test('[ getAdminMerchants] error on getting merchants -> 500 with empty body is returned', async () => {
    // Assert
    jest.mock('../business-logic/merchant.service', () => {
        return {
            MerchantService: jest.fn().mockImplementation(() => {
                return {
                    getAdminMerchants: () => null
                };
            })
        };
    });
    jest.mock('../../../layers/helper_lib/src/token-decoder', () => {
        return {
            getUserId: () => 'WwwuYAbZa6vN8smhNM-I8'
        };
    });

    const expectedResponse = response(
        {
            message: 'Access Denied'
        },
        403
    );

    const { getAdminMerchants } = require('../functions/get-admin-merchants-handler');

    // Act
    const result = await getAdminMerchants(RequestBody.merchantRequestBody);

    // Assert
    expect(result).toMatchObject(expectedResponse);
});

test('[ getAdminMerchants] all merchants returned', async () => {
    // Assert
    jest.mock('../business-logic/merchant.service', () => {
        const userMerchants = [
            {
                id: '6693410635864080384',
                name: 'name 1',
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
                name: 'name 2',
                MerchantProductRequireds: []
            }
        ];
        return {
            MerchantService: jest.fn().mockImplementation(() => {
                return {
                    getAdminMerchants: jest.fn().mockImplementation(() => {
                        return userMerchants;
                    })
                };
            })
        };
    });
    jest.mock('../../../layers/helper_lib/src/token-decoder', () => {
        return {
            getUserId: () => 'WwwuYAbZa6vN8smhNM-I8'
        };
    });

    const { getAdminMerchants } = require('../functions/get-admin-merchants-handler');
    //const body = JSON.stringify({ searchedString: 'email', includeMerchantId: 2 });
    // Act
    const result = await getAdminMerchants(RequestBody.merchantRequestBody);

    // Assert
    expect(result.statusCode).toBe(403);
    const entity = JSON.parse(result.body);
    expect(entity).not.toBeNull();
});
