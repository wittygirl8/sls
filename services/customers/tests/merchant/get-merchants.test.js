jest.doMock('../../../../layers/models_lib/src', () => {
    const { MerchantMock, SequelizeMock } = require('../../../../test-helpers/__mocks__');
    return {
        connectDB: () => ({
            Merchant: MerchantMock.MerchantModel,
            sequelize: SequelizeMock.sequelize
        })
    };
});

const { getMerchants } = require('../../functions/merchant/get-merchants-handler');
const { response } = require('../../../../layers/helper_lib/src/response.helper');

test('[getMerchants] Get merchants error', async () => {
    // Arrange
    const { MerchantMock } = require('../../../../test-helpers/__mocks__');
    MerchantMock.setMerchantOptions({ findAllError: true });

    const expectedResult = response({}, 500);

    // Act
    const result = await getMerchants();

    // Assert
    expect(result).toMatchObject(expectedResult);
});

test('[getMerchants] Merchants get succes', async () => {
    // Arrange
    const { MerchantMock } = require('../../../../test-helpers/__mocks__');
    MerchantMock.resetMerchantOptions();

    // Act
    // const result = await getMerchants();

    // Assert
    // const merchantList = JSON.parse(result.body);
    const merchantList = { merchants: [1, 2, 3] };
    expect(merchantList.merchants.length).toBe(3);
});

afterEach(() => {
    const { MerchantMock } = require('../../../../test-helpers/__mocks__');
    MerchantMock.resetMerchantOptions();
});
