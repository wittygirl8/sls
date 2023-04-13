beforeEach(() => {
    jest.resetModules();
    jest.mock('../../../../../layers/models_lib/src', () => {
        const { InternalTransfersMock, SequelizeMock } = require('../../../../../test-helpers/__mocks__');
        return {
            connectDB: () => ({
                InternalTransfers: InternalTransfersMock.InternalTransfersModel,
                sequelize: SequelizeMock.sequelize
            })
        };
    });
});

test('Submitting an internal transfer with invalid data', async () => {
    //Arrange
    const { InternalTransferService } = require('../../../business-logic/internal-transfer.service');
    const internalTransferService = new InternalTransferService();

    const event = {
        body: {}
    };
    event.body = JSON.stringify(event.body);

    //Act
    try {
        await internalTransferService.SubmitInternalTransfer(event);
    } catch (error) {
        //Assert
        expect(error).toBe('Invalid request data');
    }
});

test('Submitting an internal transfer and it is saved in DB', async () => {
    //Arrange
    const { MerchantMock, UserMock, InternalTransfersMock } = require('../../../../../test-helpers/__mocks__');
    const { InternalTransferService } = require('../../../business-logic/internal-transfer.service');
    const internalTransferService = new InternalTransferService();
    const amount = 10;
    const merchantFromId = MerchantMock.MerchantList[0].id;
    const merchantToId = MerchantMock.MerchantList[0].id;
    const requestedByUserId = UserMock.UserList[0].id;
    const description = 'Description';

    const event = {
        body: {
            amount: amount,
            merchantFromId: merchantFromId,
            merchantToId: merchantToId,
            requestedByUserId: requestedByUserId,
            description: description
        }
    };
    event.body = JSON.stringify(event.body);

    //Act
    await internalTransferService.SubmitInternalTransfer(event);
    const insertedInternalTransfer = InternalTransfersMock.InternalTransfersList[0];

    //Assert
    expect(insertedInternalTransfer.amount).toBe(amount);
    expect(insertedInternalTransfer.merchantFromId).toBe(merchantFromId);
    expect(insertedInternalTransfer.merchantToId).toBe(merchantToId);
    expect(insertedInternalTransfer.requestedBy).toBe(requestedByUserId);
    expect(insertedInternalTransfer.description).toBe(description);
});
