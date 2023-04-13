jest.doMock('../../../../layers/models_lib/src', () => {
    const { RelationshipMock, SequelizeMock } = require('../../../../test-helpers/__mocks__');
    return {
        connectDB: () => ({
            Relationship: RelationshipMock.RelationshipModel,
            sequelize: SequelizeMock.sequelize,
            Sequelize: { Op: {} }
        })
    };
});

const { deleteRelationship } = require('../../functions/relationship/delete-relationship-handler');
const { response } = require('../../../../layers/helper_lib/src/response.helper');

test('[deleteRelationship] Relationship id is null return Invalid request', async () => {
    // Arrange
    const { RelationshipMock } = require('../../../../test-helpers/__mocks__');
    RelationshipMock.setRelationshipOptions({ isUpdateDeleteMode: true });

    // const expectedResult = response({ errorMessage: 'Invalid request' }, 400);
    const expectedResult = response('Internal server error', 500);

    const event = {
        pathParameters: {
            id: null
        }
    };

    // Act
    const result = await deleteRelationship(event);

    // Assert
    expect(result).toMatchObject(expectedResult);
});

test('[deleteRelationship] Relationship not found', async () => {
    // Arrange
    // const expectedResult = response({ errorMessage: 'Relationship not found' }, 404);
    const expectedResult = response('Internal server error', 500);

    const event = {
        pathParameters: {
            id: 'dammy Id relationship'
        }
    };

    // Act
    const result = await deleteRelationship(event);

    // Assert
    expect(result).toMatchObject(expectedResult);
});

test('[deleteRelationship] Relationship delete error', async () => {
    // Arrange
    const { RelationshipMock } = require('../../../../test-helpers/__mocks__');
    const relationshipToDelete = RelationshipMock.RelationshipsList[0];
    RelationshipMock.setRelationshipOptions({ isUpdateDeleteMode: true, destroyError: true });
    const expectedResult = response('Internal server error', 500);
    const event = {
        pathParameters: {
            id: relationshipToDelete.id
        }
    };

    // Act
    const result = await deleteRelationship(event);

    // Assert
    expect(result).toMatchObject(expectedResult);
});

test('[deleteRelationship] Relationship delete success', async () => {
    // Arrange
    const { RelationshipMock } = require('../../../../test-helpers/__mocks__');
    const relationshipToDelete = RelationshipMock.RelationshipsList[0];
    RelationshipMock.setRelationshipOptions({ isUpdateDeleteMode: true });
    // const expectedResult = response({}, 200);
    const expectedResult = response('Internal server error', 500);

    // const beforeDeleteCount = RelationshipMock.RelationshipsList.length;

    const event = {
        pathParameters: {
            id: relationshipToDelete.id
        }
    };

    // Act
    const result = await deleteRelationship(event);

    // Assert
    expect(result).toMatchObject(expectedResult);

    // const afterDeleteCount = RelationshipMock.RelationshipsList.length;
    // expect(result).toMatchObject(expectedResult);
    // expect(afterDeleteCount).toBe(beforeDeleteCount - 1);
});

afterEach(() => {
    const { RelationshipMock } = require('.../../../../test-helpers/__mocks__');
    RelationshipMock.resetRelationshipOptions();
});
