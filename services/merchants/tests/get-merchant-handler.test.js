const { response } = require('../../../layers/helper_lib/src');
const { RequestBody } = require('../../../test-helpers/__mocks__');

beforeEach(() => {
    jest.resetModules();
});

test('[getMerchant] merchant doesn exist -> 404 is returned', async () => {
    // Assert
    jest.mock('../business-logic/merchant.service', () => {
        return {
            MerchantService: jest.fn().mockImplementation(() => {
                return {
                    getById: () => null
                };
            })
        };
    });

    const expectedResponse = response({}, 404);
    const getMerchant = require('../functions/get-merchant-handler').getMerchant;

    // Act
    const result = await getMerchant(RequestBody.merchantRequestBody);

    // Assert
    expect(result).toMatchObject(expectedResponse);
});

test('[getMerchant] merchant exists -> entity is returned', async () => {
    // Assert
    jest.mock('../business-logic/merchant.service', () => {
        return {
            MerchantService: jest.fn().mockImplementation(() => {
                return {
                    getById: () => {
                        return {
                            name: 'Test Merchant',
                            onboardingStep: 1
                        };
                    }
                };
            })
        };
    });

    const getMerchant = require('../functions/get-merchant-handler').getMerchant;

    // Act
    const result = await getMerchant(RequestBody.merchantRequestBody);

    // Assert
    expect(result.statusCode).toBe(200);
    const entity = JSON.parse(result.body);
    expect(entity).not.toBeNull();
    expect(entity.name).toBe('Test Merchant');
    expect(entity.onboardingStep).toBe(1);
});

test('[getMerchant] error is thrown -> 500 is returned', async () => {
    // Assert
    jest.mock('../business-logic/merchant.service', () => {
        return {
            MerchantService: jest.fn().mockImplementation(() => {
                return {
                    getById: () => {
                        throw 'Error';
                    }
                };
            })
        };
    });

    const getMerchant = require('../functions/get-merchant-handler').getMerchant;

    // Act
    const result = await getMerchant(RequestBody.merchantRequestBody);

    // Assert
    expect(result.statusCode).toBe(500);
});
