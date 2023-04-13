jest.doMock('../../../../layers/models_lib/src', () => {
    const { MerchantMock, SequelizeMock } = require('../../../../test-helpers/__mocks__');
    return {
        connectDB: () => ({
            Merchant: MerchantMock.MerchantModel,
            sequelize: SequelizeMock.sequelize,
            Sequelize: { Op: {} }
        })
    };
});

const { deleteMerchant } = require('../../functions/merchant/delete-merchant-handler');
const { response } = require('../../../../layers/helper_lib/src/response.helper');
const { RequestBody } = require('../../../../test-helpers/__mocks__');

test('[deleteMerchant] Merchant entity not found', async () => {
    // Arrange
    const { MerchantMock } = require('../../../../test-helpers/__mocks__');
    MerchantMock.setMerchantOptions({ isUpdateDeleteMode: true });

    const expectedResult = response({ errorMessage: 'Entity not found' }, 404);

    const path = {
        businessId: 'businessId',
        clientId: 'clientId',
        merchantId: ''
    };

    const event = { pathParameters: path, headers: RequestBody.headers };

    // Act
    const result = await deleteMerchant(event);

    // Assert
    expect(result).toMatchObject(expectedResult);
});

test('[deleteMerchant] Merchant delete error', async () => {
    // Arrange
    const { MerchantMock } = require('../../../../test-helpers/__mocks__');
    const merchantToDelete = MerchantMock.MerchantList[0];
    MerchantMock.setMerchantOptions({ isUpdateDeleteMode: true, destroyError: true });
    const expectedResult = response({}, 500);

    const path = {
        businessId: 'businessId',
        clientId: 'clientId',
        merchantId: merchantToDelete.id
    };

    const event = { pathParameters: path, headers: RequestBody.headers };

    // Act
    const result = await deleteMerchant(event);

    // Assert
    expect(result).toMatchObject(expectedResult);
});

test('[deleteMerchant] Merchant delete success', async () => {
    // Arrange
    const { MerchantMock } = require('../../../../test-helpers/__mocks__');
    const merchantToDelete = MerchantMock.MerchantList[0];
    MerchantMock.setMerchantOptions({ isUpdateDeleteMode: true });
    const expectedResult = response({}, 200);

    const beforeDeleteCount = MerchantMock.MerchantList.length;

    const path = {
        businessId: 'businessId',
        clientId: 'clientId',
        merchantId: merchantToDelete.id
    };

    const event = { pathParameters: path, headers: RequestBody.headers };

    // Act
    const result = await deleteMerchant(event);

    // Assert
    expect(result).toMatchObject(expectedResult);

    const afterDeleteCount = MerchantMock.MerchantList.length;
    expect(result).toMatchObject(expectedResult);
    expect(afterDeleteCount).toBe(beforeDeleteCount - 1);
});

afterEach(() => {
    const { MerchantMock } = require('.../../../../test-helpers/__mocks__');
    MerchantMock.resetMerchantOptions();
});
