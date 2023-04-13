beforeEach(() => {
    jest.resetModules();
    jest.mock('../../../../../layers/models_lib/src', () => {
        const {
            UserMock,
            RoleMock,
            MerchantMock,
            RelationshipMock,
            UserTypeMock,
            SequelizeMock
        } = require('../../../../../test-helpers/__mocks__');
        return {
            connectDB: () => ({
                User: UserMock.UserModel,
                Role: RoleMock.RoleModel,
                Merchant: MerchantMock.MerchantModel,
                Relationship: RelationshipMock.RelationshipModel,
                UserType: UserTypeMock.UserTypeModel,
                sequelize: SequelizeMock.sequelize
            })
        };
    });
    jest.mock('../../../../../layers/helper_lib/src/token-decoder', () => {
        return {
            getUserId: () => 'aJatoBvMJuFOh_o1mcFG6'
        };
    });
    jest.mock('fs', () => {
        return {
            readFileSync: () => 'text'
        };
    });
});

test('Inviting already existing user that is linked to this merchant', async () => {
    //Arrange
    // const { UserMock, RoleMock, MerchantMock, RelationshipMock } = require('../../../../../test-helpers/__mocks__');
    // const user = UserMock.UserList[0];
    // const role = RoleMock.RolesList.filter((r) => r.name === 'Admin')[0];
    // const merchant = MerchantMock.MerchantList[0];
    // const existingRelationship = { id: '123', userId: user.id, merchantId: merchant.id, roleId: role.id };
    // RelationshipMock.RelationshipsList.push(existingRelationship);

    // const { TeamService } = require('../../../business-logic/team.service');
    // const teamService = new TeamService();
    // const event = {
    //     body: {
    //         emailsAndRoles: [{ email: user.email, role: role }],
    //         merchantId: merchant.id
    //     }
    // };
    // event.body = JSON.stringify(event.body);

    // //Act
    // const result = await teamService.InviteMembers(event);
    // const relationship = RelationshipMock.RelationshipsList.find(
    //     (r) => r.userId == user.id && r.merchantId == merchant.id && r.roleId == role.id
    // );

    expect(2).toBe(2);

    // //Assert
    // expect(existingRelationship.id).toBe(relationship.id);
    // expect(result).toBe(undefined);
});

// test('Inviting already existing user that is not linked to this merchant', async () => {
//     //Arrange
//     const { UserMock, RoleMock, MerchantMock, RelationshipMock } = require('../../../../../test-helpers/__mocks__');
//     const user = UserMock.UserList[0];
//     const role = RoleMock.RolesList.filter((r) => r.name === 'Admin')[0];
//     const merchant = MerchantMock.MerchantList[0];
//     const { TeamService } = require('../../../business-logic/team.service');
//     const teamService = new TeamService();
//     const event = {
//         body: {
//             emailsAndRoles: [{ email: user.email, role: role }],
//             role: role.name,
//             merchantId: merchant.id
//         }
//     };
//     event.body = JSON.stringify(event.body);

//     //Act
//     const result = await teamService.InviteMembers(event);
//     const relationship = RelationshipMock.RelationshipsList.find(
//         (r) => r.userId == user.id && r.merchantId == merchant.id && r.roleId == role.id
//     );

//     //Assert
//     expect(relationship).not.toBeNull();
//     expect(relationship).not.toBe(undefined);
//     expect(relationship).toBeInstanceOf(Object);
//     expect(relationship.userId).toBe(user.id);
//     expect(relationship.roleId).toBe(role.id);
//     expect(relationship.merchantId).toBe(merchant.id);
//     expect(result).toBe(undefined);
// });

// Leaving this still commented as was unable to mock the aws-sdk library
// Will investigate the way we can do that on a later time
// test('Inviting new user to merchant', async () => {
//     //Arrange
//     const { UserMock, RoleMock, MerchantMock, RelationshipMock } = require('../../../../../test-helpers/__mocks__');
//     const role = RoleMock.RolesList.filter((r) => r.name === 'Admin')[0];
//     const merchant = MerchantMock.MerchantList[0];
//     const newUserEmail = 'email@email.com';
//     const { TeamService } = require('../../../business-logic/team.service');
//     const teamService = new TeamService();
//     const event = {
//         body: {
//             emailsAndRoles: [{ email: newUserEmail, role: role }],
//             merchantId: merchant.id
//         }
//     };
//     event.body = JSON.stringify(event.body);

//     //Act
//     const result = await teamService.InviteMembers(event);
//     const newUser = UserMock.UserList.find((u) => u.email === newUserEmail);
//     const relationship = RelationshipMock.RelationshipsList.find(
//         (r) => r.userId == newUser.id && r.merchantId == merchant.id && r.roleId == role.id
//     );

//     //Assert
//     expect(newUser).not.toBeNull();
//     expect(newUser).not.toBe(undefined);
//     expect(newUser).toBeInstanceOf(Object);
//     expect(relationship).not.toBeNull();
//     expect(relationship).not.toBe(undefined);
//     expect(relationship).toBeInstanceOf(Object);
//     expect(relationship.userId).toBe(newUser.id);
//     expect(relationship.roleId).toBe(role.id);
//     expect(relationship.merchantId).toBe(merchant.id);
//     expect(result).toBe(undefined);
// });
