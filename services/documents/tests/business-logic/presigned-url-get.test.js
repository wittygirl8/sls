beforeEach(() => {
    jest.resetModules();
});
test('[preSignedUrlGet] Get Presigned Url for Get error', async () => {
    //Arrange
    var AWSMock = require('aws-sdk-mock');

    AWSMock.mock('S3', 'getSignedUrl', (action, _params, callback) => {
        callback(new Error('Token expired'), null);
    });

    const { DocumentService } = require('../../business-logic/document.service');

    // Act
    try {
        await new DocumentService({}).preSignedUrlGet('merchant', '4645646456', '34535345', {
            filename: 'qwerty.go'
        });
    } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(Error);
        expect(error).toHaveProperty('message', 'Token expired');
    }
});

test('[preSignedUrlGet] Get Presigned Url for Get success', async () => {
    //Arrange
    var AWSMock = require('aws-sdk-mock');

    AWSMock.mock('S3', 'getSignedUrl', (action, _params, callback) => {
        callback(null, 'https://example.com/getUrl');
    });

    const { DocumentService } = require('../../business-logic/document.service');

    // Act
    const result = await new DocumentService({}).preSignedUrlGet('merchant', '4645646456', '34534543', {
        filename: 'qwerty.go'
    });

    // Assert
    expect(result).not.toBeNull();
    expect(result.documentId).toBe('34534543');
    expect(result.presignedUrl).toBe('https://example.com/getUrl');
});
