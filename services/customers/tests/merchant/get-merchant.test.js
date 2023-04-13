jest.doMock('../../../../layers/models_lib/src', () => {
    const { MerchantMock, SequelizeMock } = require('../../../../test-helpers/__mocks__');
    return {
        connectDB: () => ({
            Merchant: MerchantMock.MerchantModel,
            sequelize: SequelizeMock.sequelize
        })
    };
});

const { response } = require('../../../../layers/helper_lib/src/response.helper');
const { RequestBody } = require('../../../../test-helpers/__mocks__');
test('[getMerchant] Merchant entity not found', async () => {
    // Arrange
    const expectedResult = response({ errorMessage: 'Entity not found' }, 404);

    const { getMerchant } = require('../../functions/merchant/get-merchant-handler');

    // Act
    const result = await getMerchant({ pathParameters: { merchantId: '' }, headers: RequestBody.headers });

    // Assert
    expect(result).toMatchObject(expectedResult);
});

test('[getMerchant] Merchant getById error', async () => {
    // Arrange
    const { MerchantMock } = require('../../../../test-helpers/__mocks__');
    const merchantExisting = MerchantMock.MerchantList[0];
    MerchantMock.setMerchantOptions({ findByPkError: true });

    const expectedResult = response({}, 500);

    const { getMerchant } = require('../../functions/merchant/get-merchant-handler');

    // Act
    const result = await getMerchant({
        pathParameters: { merchantId: merchantExisting.id },
        headers: RequestBody.headers
    });

    // Assert
    expect(result).toMatchObject(expectedResult);
});

test('[getMerchant] Merchant get succes', async () => {
    // Arrange
    const { MerchantMock } = require('../../../../test-helpers/__mocks__');
    const merchantExisting = MerchantMock.MerchantList[0];

    const expectedResult = response(merchantExisting, 200);

    const { getMerchant } = require('../../functions/merchant/get-merchant-handler');

    // Act
    const result = await getMerchant({
        pathParameters: { merchantId: merchantExisting.id },
        headers: RequestBody.headers
    });

    // Assert
    expect(result).toMatchObject(expectedResult);
});

afterEach(() => {
    const { MerchantMock } = require('../../../../test-helpers/__mocks__');
    MerchantMock.resetMerchantOptions();
});
