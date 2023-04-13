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

const { response } = require('../../../../layers/helper_lib/src/response.helper');
const { RequestBody } = require('../../../../test-helpers/__mocks__');

test('[updateMerchant] Merchant entity not found', async () => {
    // Arrange
    const { MerchantMock } = require('../../../../test-helpers/__mocks__');
    MerchantMock.setMerchantOptions({ isUpdateDeleteMode: true });

    const expectedResult = response({ errorMessage: 'Entity not found' }, 404);

    const merchantTest = {
        name: 'merchant Name'
    };

    const path = {
        businessId: 'businessId',
        clientId: 'clientId',
        merchantId: ''
    };

    const event = {
        body: JSON.stringify({ merchant: merchantTest }),
        pathParameters: path,
        headers: RequestBody.headers
    };

    const { updateMerchant } = require('../../functions/merchant/update-merchant-handler');

    // Act
    const result = await updateMerchant(event);

    // Assert
    expect(result).toMatchObject(expectedResult);
});

test('[updateMerchant] Merchant update error', async () => {
    // Arrange
    const { MerchantMock } = require('../../../../test-helpers/__mocks__');
    const merchantToUpdate = MerchantMock.MerchantList[0];
    MerchantMock.setMerchantOptions({ isUpdateDeleteMode: true, updateError: true });
    const expectedResult = response({}, 500);

    const merchantTestUpdated = {
        name: 'merchant Name updated'
    };

    const path = {
        businessId: 'businessId',
        clientId: 'clientId',
        merchantId: merchantToUpdate.id
    };

    const event = {
        body: JSON.stringify({ merchant: merchantTestUpdated }),
        pathParameters: path,
        headers: RequestBody.headers
    };

    const { updateMerchant } = require('../../functions/merchant/update-merchant-handler');

    // Act
    const result = await updateMerchant(event);

    // Assert
    expect(result).toMatchObject(expectedResult);
});

test('[updateMerchant] Merchant update succes', async () => {
    // Arrange
    const { MerchantMock } = require('../../../../test-helpers/__mocks__');
    const merchantToUpdate = MerchantMock.MerchantList[0];
    MerchantMock.setMerchantOptions({ isUpdateDeleteMode: true });
    const expectedResult = response({}, 200);

    const merchantTestUpdated = {
        name: 'merchant Name updated'
    };

    const path = {
        businessId: 'businessId',
        clientId: 'clientId',
        merchantId: merchantToUpdate.id
    };

    const event = {
        body: JSON.stringify({ merchant: merchantTestUpdated }),
        pathParameters: path,
        headers: RequestBody.headers
    };

    const { updateMerchant } = require('../../functions/merchant/update-merchant-handler');

    // Act
    const result = await updateMerchant(event);

    // Assert
    expect(result).toMatchObject(expectedResult);

    const updatedMerchant = MerchantMock.MerchantList[0];
    expect(updatedMerchant.name).toBe(merchantTestUpdated.name);
});

afterEach(() => {
    const { MerchantMock } = require('../../../../test-helpers/__mocks__');
    MerchantMock.resetMerchantOptions();
});
