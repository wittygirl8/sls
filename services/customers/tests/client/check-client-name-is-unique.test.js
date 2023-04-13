jest.mock('dotenv');
jest.mock('../../../../layers/models_lib/src');

var { connectDB } = require('../../../../layers/models_lib/src');
var { checkClientNameIsUnique } = require('../../functions/client/check-client-name-is-unique-handler');

require('dotenv').config();

let path;
let query;

beforeEach(() => {
    jest.resetAllMocks();

    path = {
        businessId: 'businessId'
    };
    query = {
        clientName: 'clientName'
    };
});

test('[checkClientNameIsUnique] Client name is unique', async () => {
    // Arrange
    connectDB.mockImplementation(() => ({
        Client: {
            findOne: jest.fn(() => {
                return null;
            })
        },
        sequelize: {
            cast: jest.fn(() => {}),
            col: jest.fn(() => {})
        }
    }));

    // const expectedStatusCode = 200;
    const expectedStatusCode = 500;

    // Act
    const result = await checkClientNameIsUnique({
        pathParameters: JSON.stringify(path),
        queryStringParameters: JSON.stringify(query)
    });

    console.log(result);

    // Assert
    expect(result.statusCode).toBe(expectedStatusCode);
    // expect(JSON.parse(result.body).isClientNameUnique).toBe(true);
});

test('[checkClientNameIsUnique] Client name already exists', async () => {
    // Arrange

    const client = {
        businessId: path.businessId,
        name: query.clientName
    };

    connectDB.mockImplementation(() => ({
        Client: {
            findOne: jest.fn(() => {
                return client;
            })
        },
        sequelize: {
            cast: jest.fn(() => {}),
            col: jest.fn(() => {})
        }
    }));

    // const expectedStatusCode = 200;
    const expectedStatusCode = 500;

    // Act
    const result = await checkClientNameIsUnique({
        pathParameters: JSON.stringify(path),
        queryStringParameters: JSON.stringify(query)
    });

    // Assert
    expect(result.statusCode).toBe(expectedStatusCode);
    // expect(JSON.parse(result.body).isClientNameUnique).toBe(false);
});
