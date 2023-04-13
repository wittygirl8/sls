jest.doMock('../../../../layers/models_lib/src', () => {
    const { RelationshipMock, RoleMock, SequelizeMock } = require('../../../../test-helpers/__mocks__');
    return {
        connectDB: () => ({
            Relationship: RelationshipMock.RelationshipModel,
            Role: RoleMock.RoleModel,
            sequelize: SequelizeMock.sequelize,
            Sequelize: { Op: {} }
        })
    };
});

jest.doMock('../../../../layers/helper_lib/src/token-decoder', () => {
    return {
        getUserId: () => '123'
    };
});

const { assignEntityAndRoleToUser } = require('../../functions/assign-entity-and-role-to-user-handler');
const { response } = require('../../../../layers/helper_lib/src/response.helper');

const { RoleMock } = require('../../../../test-helpers/__mocks__');
RoleMock.setRoleOptions({ getOwnerRole: true });

test('[assignEntityAndRoleToUser] assignment already exists return error', async () => {
    // Arrange
    const { RelationshipMock } = require('../../../../test-helpers/__mocks__');
    RelationshipMock.setRelationshipOptions({ findOneIsExist: true });
    const testEntity = RelationshipMock.RelationshipsList[0];

    const expectedResponse = response({ error: 'The assignment already exists.' }, 400);
    const body = { roleId: testEntity.roleId };
    const bodyJson = JSON.stringify(body);

    // Act
    const result = await assignEntityAndRoleToUser({ body: bodyJson });

    // Assert
    expect(result).toMatchObject(expectedResponse);
});

test('[assignEntityAndRoleToUser] Cannot change role for Owner error', async () => {
    // Arrange
    const { RelationshipMock } = require('../../../../test-helpers/__mocks__');
    RelationshipMock.setRelationshipOptions({ findOneWithOwnerRole: true });
    const testEntity = RelationshipMock.RelationshipsList[1];

    const expectedResponse = response({ error: 'Cannot change role for Owner.' }, 400);
    const body = { roleId: testEntity.roleId };
    const bodyJson = JSON.stringify(body);

    // Act
    const result = await assignEntityAndRoleToUser({ body: bodyJson });

    // Assert
    expect(result).toMatchObject(expectedResponse);
});

test('[assignEntityAndRoleToUser] Successfuly assign role on user ', async () => {
    // Arrange
    const { RelationshipMock } = require('../../../../test-helpers/__mocks__');
    const testEntity = RelationshipMock.RelationshipsList[0];
    RelationshipMock.resetRelationshipOptions();
    const expectedResponse = response({}, 201);
    const body = { roleId: testEntity.roleId, userId: testEntity.userId, businessId: testEntity.businessId };
    const bodyJson = JSON.stringify(body);

    // Act
    const result = await assignEntityAndRoleToUser({ body: bodyJson });

    // Assert
    expect(result).toMatchObject(expectedResponse);
});

test('[assignEntityAndRoleToUser] Sql query error', async () => {
    // Arrange
    const { RelationshipMock } = require('../../../../test-helpers/__mocks__');
    RelationshipMock.setRelationshipOptions({ errorOnSave: true });
    const testEntity = RelationshipMock.RelationshipsList[0];
    const expectedResponse = response({ error: 'Internal server error' }, 500);
    const body = {
        roleId: testEntity.roleId,
        userId: testEntity.userId,
        businessId: testEntity.businessId
    };

    const bodyJson = JSON.stringify(body);

    // Act
    const result = await assignEntityAndRoleToUser({ body: bodyJson });

    // Assert
    expect(result).toMatchObject(expectedResponse);
});

test('[assignEntityAndRoleToUser] User cannot change his own role and 401 is returned', async () => {
    // Arrange
    const { RelationshipMock } = require('../../../../test-helpers/__mocks__');
    const testEntity = RelationshipMock.RelationshipsList[0];
    RelationshipMock.resetRelationshipOptions();
    const expectedResponse = response({}, 401);
    const body = { roleId: testEntity.roleId, userId: '123', businessId: testEntity.businessId };
    const bodyJson = JSON.stringify(body);

    // Act
    const result = await assignEntityAndRoleToUser({ body: bodyJson });

    // Assert
    expect(result).toMatchObject(expectedResponse);
});
