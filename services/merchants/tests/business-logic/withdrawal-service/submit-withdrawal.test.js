beforeEach(() => {
    jest.resetModules();
    jest.mock('../../../../../layers/models_lib/src', () => {
        const { WithdrawalsMock, SequelizeMock } = require('../../../../../test-helpers/__mocks__');
        return {
            connectDB: () => ({
                Withdrawals: WithdrawalsMock.WithdrawalsModel,
                sequelize: SequelizeMock.sequelize
            })
        };
    });
});

test('Submitting a withdrawal with invalid data', async () => {
    //Arrange
    const { WithdrawalService } = require('../../../business-logic/withdrawal.service');
    const withdrawalService = new WithdrawalService();
    //Arrange
    jest.mock('../../../../../libs/repo/merchant.repo', () => {
        return {
            MerchantRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        const merchant = {
                            country: 'Ireland'
                        };
                        return merchant;
                    })
                };
            })
        };
    });

    const event = {
        body: {},
        pathParameters: {
            merchantId: 124
        }
    };
    event.body = JSON.stringify(event.body);

    //Act
    try {
        await withdrawalService.SubmitWithdrawal(event);
    } catch (error) {
        //Assert
        expect(error).toBe('Invalid request data');
    }
});

// test('Submitting a withdrawal and it is saved in DB', async () => {
//     //Arrange
//     const { MerchantMock, UserMock, WithdrawalsMock } = require('../../../../../test-helpers/__mocks__');
//     const { WithdrawalService } = require('../../../business-logic/withdrawal.service');

//     const withdrawalService = new WithdrawalService();
//     const amount = 10;
//     const merchantId = MerchantMock.MerchantList[0].id;
//     const requestedByUserId = UserMock.UserList[0].id;

//     const event = {
//         body: {
//             amount: amount,
//             merchantId: merchantId,
//             requestedByUserId: requestedByUserId
//         }
//     };
//     event.body = JSON.stringify(event.body);

//     //Act
//     await withdrawalService.SubmitWithdrawal(event);
//     const insertedWithdrawal = WithdrawalsMock.WithdrawalsList[0];

//     //Assert
//     expect(insertedWithdrawal.amount).toBe(amount);
//     expect(insertedWithdrawal.merchantId).toBe(merchantId);
//     expect(insertedWithdrawal.requestedBy).toBe(requestedByUserId);
// });
