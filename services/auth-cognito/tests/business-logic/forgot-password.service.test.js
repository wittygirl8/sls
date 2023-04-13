beforeEach(() => {
    jest.resetModules();

    jest.mock('../../../../layers/models_lib/src', () => {
        const { SequelizeMock } = require('../../../../test-helpers/__mocks__');
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

test('[Forgot password UserProvider Throws error]', async () => {
    //Arrange
    jest.mock('../../../../libs/repo/reseller.repo.js', () => {
        return {
            ResellerRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        throw 'Error';
                    })
                };
            })
        };
    });

    const { CognitoCustomMessagesService } = require('../../business-logic/cognito-custom-messages.service');
    const cognitoCustomMessagesService = new CognitoCustomMessagesService();

    // Act
    try {
        await cognitoCustomMessagesService.sendForgotPasswordEmail('url', '####', 'portal_url', false);
    } catch (error) {
        // Assert
        expect(error).toBe('Error');
    }
});

test('[Forgot password succes]', async () => {
    //Arrange
    jest.mock('../../../../libs/repo/reseller.repo.js', () => {
        return {
            ResellerRepo: jest.fn().mockImplementation(() => {
                return {
                    findOne: jest.fn().mockImplementation(() => {
                        return {
                            logo: 'logo',
                            contactUsPageURL: 'contactUsPageURL',
                            portalURL: 'portalURL',
                            name: 'name',
                            suportEmail: 'suportEmail',
                            termAndCondPageUrl: 'termAndCondPageUrl',
                            supportTelNo: 'supportTelNo',
                            brandingURL: 'brandingURL',
                            senderEmail: 'senderEmail',
                            website: 'website',
                            address: 'address'
                        };
                    })
                };
            })
        };
    });

    const { CognitoCustomMessagesService } = require('../../business-logic/cognito-custom-messages.service');
    const cognitoCustomMessagesService = new CognitoCustomMessagesService();

    // Act
    const result = await cognitoCustomMessagesService.sendForgotPasswordEmail('url', '####', 'portal_url', false);

    // Assert
    expect(result.emailSubject).toBe('Reset your name Password');
    expect(result.emailTemplate).not.toBeNull();
});
