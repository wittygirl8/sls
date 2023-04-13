beforeEach(() => {
    jest.resetModules();
});

test('[preSignedUrlPut] Get Presigned Url for Put s3 error', async () => {
    //Arrange
    var AWSMock = require('aws-sdk-mock');

    AWSMock.mock('S3', 'getSignedUrl', (action, _params, callback) => {
        callback(new Error('Invalid Token'), null);
    });

    const { DocumentService } = require('../../business-logic/document.service');

    // Act
    try {
        await new DocumentService({}).preSignedUrlPut('merchant', '4645646456', {
            filename: 'qwerty.go',
            size: '1424567'
        });
    } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(Error);
        expect(error).toHaveProperty('message', 'Invalid Token');
    }
});

test('[preSignedUrlPut] Get Presigned Url for Put success', async () => {
    //Arrange
    var AWSMock = require('aws-sdk-mock');

    AWSMock.mock('S3', 'getSignedUrl', (action, _params, callback) => {
        callback(null, 'https://example.com');
    });

    const { DocumentService } = require('../../business-logic/document.service');

    // Act
    const result = await new DocumentService({}).preSignedUrlPut('merchant', '4645646456', {
        filename: 'qwerty.go',
        size: '1424567'
    });

    // Assert
    expect(result).not.toBeNull();
    expect(result.presignedUrl).toBe('https://example.com');
});
