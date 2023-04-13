jest.doMock('../../../layers/models_lib/src', () => {
    const {
        MerchantMock,
        RelationshipMock,
        RoleMock,
        SequelizeMock,
        UserMock
    } = require('../../../test-helpers/__mocks__');
    return {
        connectDB: () => ({
            Merchant: MerchantMock.MerchantModel,
            Relationship: RelationshipMock.RelationshipModel,
            Role: RoleMock.RoleModel,
            sequelize: SequelizeMock.sequelize,
            User: UserMock.UserModel,
            Sequelize: { Op: {} },
            ReferralData: {
                findOne: () => null,
                build: () => ({
                    save: () => {}
                })
            }
        })
    };
});

jest.doMock('../../../layers/helper_lib/src/token-decoder', () => {
    return {
        getUserId: () => 'ussrId'
    };
});

const { createUserMerchant } = require('../functions/create-user-merchant-handler');
const { response } = require('../../../layers/helper_lib/src/response.helper');

test('[createUserMerchant] Merchant save error', async () => {
    // Arrange
    jest.mock('../business-logic/referal-data.service', () => {
        return {
            RefferalDataService: jest.fn().mockImplementation(() => {
                return {
                    captureRefferalData: () => null
                };
            })
        };
    });

    const { MerchantMock } = require('../../../test-helpers/__mocks__');
    MerchantMock.setMerchantOptions({ saveError: true });

    const expectedResult = response({}, 500);
    const data = JSON.stringify({
        name: 'merchant name',
        country: 'Canada'
    });

    // Act
    const result = await createUserMerchant({ body: data });

    // Assert
    expect(result).toMatchObject(expectedResult);
});

test('[createUserMerchant] Merchant save success', async () => {
    jest.mock('../business-logic/referal-data.service', () => {
        return {
            RefferalDataService: jest.fn().mockImplementation(() => {
                return {
                    captureRefferalData: () => null
                };
            })
        };
    });

    jest.mock('../helpers/foodHubWebHookUrl', () => {
        return {
            foodHubWebHook: () => null
        };
    });

    // Arrange
    const { MerchantMock } = require('../../../test-helpers/__mocks__');
    const expectedResult = response({}, 201);
    const data = JSON.stringify({
        name: 'merchant name',
        country: 'Canada'
    });

    const beforeCreateCount = MerchantMock.MerchantList.length;

    // Act
    const result = await createUserMerchant({ body: data });

    // Assert
    const afterCreateCount = MerchantMock.MerchantList.length;

    expect(result).toMatchObject(expectedResult);
    expect(afterCreateCount).toBe(beforeCreateCount + 1);
    const createdMerchant = MerchantMock.MerchantList.find((merchant) => merchant.name === data.name);
    expect(createdMerchant).not.toBeNull();
});

test('[createUserMerchant] Merchant save name already exists', async () => {
    jest.mock('../business-logic/referal-data.service', () => {
        return {
            RefferalDataService: jest.fn().mockImplementation(() => {
                return {
                    captureRefferalData: () => null
                };
            })
        };
    });
    // Arrange
    const { MerchantMock } = require('../../../test-helpers/__mocks__');
    MerchantMock.setMerchantOptions({ findOneEntityExists: true });
    const expectedResult = response('Merchant name already exists.', 400);
    const data = JSON.stringify({
        name: 'Merchant 1',
        country: 'Canada'
    });

    const beforeCreateCount = MerchantMock.MerchantList.length;

    // Act
    const result = await createUserMerchant({ body: data });

    // Assert
    const afterCreateCount = MerchantMock.MerchantList.length;

    expect(result).toMatchObject(expectedResult);
    expect(afterCreateCount).toBe(beforeCreateCount);
    const createdMerchant = MerchantMock.MerchantList.find((merchant) => merchant.name === data.name);
    expect(createdMerchant).not.toBeNull();
});

afterEach(() => {
    const { MerchantMock, RelationshipMock, RoleMock } = require('../../../test-helpers/__mocks__');
    MerchantMock.resetMerchantOptions();
    RoleMock.resetRoleOptions();
    RelationshipMock.resetRelationshipOptions();
});
