jest.mock('dotenv');
jest.mock('../../../../layers/models_lib/src');

var { connectDB } = require('../../../../layers/models_lib/src');
var { checkMerchantNameIsUnique } = require('../../functions/merchant/check-merchant-name-is-unique-handler');

require('dotenv').config();

let path;
let query;

beforeEach(() => {
    jest.resetAllMocks();

    path = {
        clientId: 'clientId',
    };
    query = {
        merchantName: 'merchantName',
    };
});

test('[checkClientNameIsUnique] Merchant name is unique', async () => {
    // Arrange
    connectDB.mockImplementation(() => ({
        Merchant: {
            findOne: jest.fn(() => {
                return null;
            }),
        },
        sequelize: {
            cast: jest.fn(() => {}),
            col: jest.fn(() => {}),
        },
    }));

    const expectedStatusCode = 200;

    // Act
    const result = await checkMerchantNameIsUnique({
        pathParameters: JSON.stringify(path),
        queryStringParameters: JSON.stringify(query),
    });

    console.log(result);

    // Assert
    expect(result.statusCode).toBe(expectedStatusCode);
    expect(JSON.parse(result.body).isMerchantNameUnique).toBe(true);
});

test('[checkClientNameIsUnique] Merchant name already exists', async () => {
    // Arrange

    const merchant = {
        clientId: path.clientId,
        name: query.merchantName,
    };

    connectDB.mockImplementation(() => ({
        Merchant: {
            findOne: jest.fn(() => {
                return merchant;
            }),
        },
        sequelize: {
            cast: jest.fn(() => {}),
            col: jest.fn(() => {}),
        },
    }));

    const expectedStatusCode = 200;

    // Act
    const result = await checkMerchantNameIsUnique({
        pathParameters: JSON.stringify(path),
        queryStringParameters: JSON.stringify(query),
    });

    // Assert
    expect(result.statusCode).toBe(expectedStatusCode);
    expect(JSON.parse(result.body).isMerchantNameUnique).toBe(false);
});
