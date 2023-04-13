const { response } = require('../../../../../layers/helper_lib/src');
const { RequestBody } = require('../../../../../test-helpers/__mocks__');

beforeEach(() => {
    jest.resetModules();

    jest.mock('../../../../../layers/models_lib/src', () => {
        const { SequelizeMock } = require('../../../../../test-helpers/__mocks__');
        return {
            connectDB: () => ({
                sequelize: SequelizeMock.sequelize,
                Sequelize: {
                    Op: {}
                }
            })
        };
    });
});

test('[onboardingComplete] merchant does not exist', async () => {
    //Arrange
    jest.mock('../../../../../libs/repo/merchant.repo', () => {
        return {
            MerchantRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return undefined;
                    })
                };
            })
        };
    });

    const expectedResponse = response({}, 404);
    const onboardingComplete = require('../../../functions/onboarding/complete-handler').onboardingComplete;

    // Act
    const result = await onboardingComplete(RequestBody.merchantRequestBody);

    // Assert
    expect(result).toMatchObject(expectedResponse);
});

// test('[onboardingComplete] merchant is updated', async () => {
//     //Arrange
//     jest.mock('../../../../../libs/repo/merchant.repo', () => {
//         const merchant = {
//             id: '45557',
//             primaryOwnerId: 1,
//             legalName: 'Merchant',
//             onboardingStep: 7,
//             status: 0
//         };

//         return {
//             MerchantRepo: jest.fn().mockImplementation(() => {
//                 return {
//                     findOne: jest.fn().mockImplementation(() => {
//                         return merchant;
//                     }),
//                     update: jest.fn().mockImplementation(() => {
//                         return true;
//                     })
//                 };
//             })
//         };
//     });

//     jest.mock('../../../../../layers/helper_lib/src/token-decoder', () => {
//         return {
//             getUserId: () => '123456'
//         };
//     });

//     jest.mock('../../../../../libs/repo/relationship.repo', () => {
//         const relationship = {
//             resellerId: '123456'
//         };

//         return {
//             RelationshipRepo: jest.fn().mockImplementation(() => {
//                 return {
//                     findOne: jest.fn().mockImplementation(() => {
//                         return relationship;
//                     })
//                 };
//             })
//         };
//     });
//     jest.mock('../../../../../libs/repo/reseller.repo', () => {
//         return {
//             ResellerRepo: jest.fn().mockImplementation(() => {
//                 return {
//                     findOne: jest.fn().mockImplementation(() => {
//                         return {};
//                     })
//                 };
//             })
//         };
//     });
//     jest.mock('../../../../../libs/repo/ownerdetails.repo', () => {
//         return {
//             OwnersDetailsRepo: jest.fn().mockImplementation(() => {
//                 return {
//                     findOne: jest.fn().mockImplementation(() => {
//                         return {};
//                     })
//                 };
//             })
//         };
//     });

//     const onboardingComplete = require('../../../functions/onboarding/complete-handler').onboardingComplete;

//     // Act
//     const result = await onboardingComplete({
//         pathParameters: {
//             merchantId: '45557'
//         }
//     });

//     // Assert
//     expect(result.statusCode).toBe(200);
// });
