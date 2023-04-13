jest.doMock('../../../../layers/models_lib/src', () => {
    const { MerchantMock, RelationshipMock, RoleMock, SequelizeMock } = require('../../../../test-helpers/__mocks__');
    return {
        connectDB: () => ({
            Merchant: MerchantMock.MerchantModel,
            Relationship: RelationshipMock.RelationshipModel,
            Role: RoleMock.RoleModel,
            sequelize: SequelizeMock.sequelize,
            Sequelize: { Op: {} }
        })
    };
});

jest.doMock('../../../../layers/helper_lib/src/token-decoder', () => {
    return {
        getUserId: () => 'ussrId'
    };
});

const { createMerchant } = require('../../functions/merchant/create-merchant-handler');
const { response } = require('../../../../layers/helper_lib/src/response.helper');

test('[createMerchant] Merchant save error', async () => {
    // Arrange
    const { MerchantMock } = require('../../../../test-helpers/__mocks__');
    MerchantMock.setMerchantOptions({ saveError: true });

    const expectedResult = response({}, 500);
    const merchantTest = {
        name: 'merchant Name'
    };
    const merchantJson = JSON.stringify({ merchant: merchantTest });

    const path = {
        businessId: 'businessId',
        clientId: 'clientId'
    };

    // Act
    const result = await createMerchant({ body: merchantJson, pathParameters: JSON.stringify(path) });

    // Assert
    expect(result).toMatchObject(expectedResult);
});

test('[createMerchant] Role not found', async () => {
    // Arrange
    const { RoleMock } = require('../../../../test-helpers/__mocks__');
    RoleMock.setRoleOptions({ notFoundError: true });

    const expectedResult = response({}, 500);
    const merchantTest = {
        name: 'merchant Name'
    };
    const merchantJson = JSON.stringify({ merchant: merchantTest });

    const path = {
        businessId: 'businessId',
        clientId: 'clientId'
    };

    // Act
    const result = await createMerchant({ body: merchantJson, pathParameters: JSON.stringify(path) });

    // Assert
    expect(result).toMatchObject(expectedResult);
});

test('[createMerchant] Relationship save error', async () => {
    // Arrange
    const { RelationshipMock } = require('../../../../test-helpers/__mocks__');
    RelationshipMock.setRelationshipOptions({ errorOnSave: true });

    const expectedResult = response({}, 500);
    const merchantTest = {
        name: 'merchant Name'
    };
    const merchantJson = JSON.stringify({ merchant: merchantTest });

    const path = {
        businessId: 'businessId',
        clientId: 'clientId'
    };

    // Act
    const result = await createMerchant({ body: merchantJson, pathParameters: JSON.stringify(path) });

    // Assert
    expect(result).toMatchObject(expectedResult);
});

test('[createMerchant] Merchant save success', async () => {
    // Arrange
    const { MerchantMock } = require('../../../../test-helpers/__mocks__');
    const expectedResult = response({}, 201);
    const merchantTest = {
        name: 'merchant Name'
    };

    const beforeCreateCount = MerchantMock.MerchantList.length;

    const merchantJson = JSON.stringify({ merchant: merchantTest });

    const path = {
        businessId: 'businessId',
        clientId: 'clientId'
    };

    // Act
    const result = await createMerchant({ body: merchantJson, pathParameters: JSON.stringify(path) });

    // Assert
    const afterCreateCount = MerchantMock.MerchantList.length;

    expect(result).toMatchObject(expectedResult);
    expect(afterCreateCount).toBe(beforeCreateCount + 1);
    const createdMerchant = MerchantMock.MerchantList.find((merchant) => merchant.name === merchantTest.name);
    expect(createdMerchant).not.toBeNull();
});

test('[createMerchant] Merchant save name already exists', async () => {
    // Arrange
    const { MerchantMock } = require('../../../../test-helpers/__mocks__');
    MerchantMock.setMerchantOptions({ findOneEntityExists: true });
    const expectedResult = response({ error: 'Merchant name already exists' }, 400);
    const merchantTest = {
        name: 'merchant Name'
    };

    const beforeCreateCount = MerchantMock.MerchantList.length;

    const merchantJson = JSON.stringify({ merchant: merchantTest });

    const path = {
        businessId: 'businessId',
        clientId: 'clientId'
    };

    // Act
    const result = await createMerchant({ body: merchantJson, pathParameters: JSON.stringify(path) });

    // Assert
    const afterCreateCount = MerchantMock.MerchantList.length;

    expect(result).toMatchObject(expectedResult);
    expect(afterCreateCount).toBe(beforeCreateCount);
    const createdMerchant = MerchantMock.MerchantList.find((merchant) => merchant.name === merchantTest.name);
    expect(createdMerchant).not.toBeNull();
});

afterEach(() => {
    const { MerchantMock, RelationshipMock, RoleMock } = require('../../../../test-helpers/__mocks__');
    MerchantMock.resetMerchantOptions();
    RoleMock.resetRoleOptions();
    RelationshipMock.resetRelationshipOptions();
});
