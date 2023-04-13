const { response } = require('../../../layers/helper_lib/src');

beforeEach(() => {
    jest.resetModules();
});

test('[getResellers] resellers throws error', async () => {
    // Assert
    jest.mock('../../../libs/repo/reseller.repo', () => {
        return {
            ResellerRepo: jest.fn().mockImplementation(() => {
                return {
                    findAll: jest.fn().mockImplementation(() => {
                        throw Error('DB error');
                    })
                };
            })
        };
    });

    const expectedResponse = response({}, 500);
    const getResellers = require('../functions/get-resellers-handler').getResellers;

    // Act
    const result = await getResellers();

    // Assert
    expect(result).toMatchObject(expectedResponse);
});

test('[getResellers] success', async () => {
    // Assert
    jest.mock('../../../libs/repo/reseller.repo', () => {
        return {
            ResellerRepo: jest.fn().mockImplementation(() => {
                return {
                    findAll: jest.fn().mockImplementation(() => {
                        return [
                            {
                                id: 1,
                                name: 'mypay',
                                logo: 'mypayLogo',
                                portalURL: 'mypayPortalURL',
                                helpPageURL: 'mypayHelpPage',
                                termAndCondPageURL: 'mypaytermAndCondPageURL',
                                portalTitle: 'mypayPortalTitle',
                                faviconLink: 'mypayFaviconLink'
                            },
                            {
                                id: 2,
                                name: 'datman',
                                logo: 'datmanLogo',
                                portalURL: 'datmanPortalURL',
                                helpPageURL: 'datmanHelpPage',
                                termAndCondPageURL: 'datmanTermAndCondPageURL',
                                portalTitle: 'datmanPortalTitle',
                                faviconLink: 'datmanFaviconLink'
                            }
                        ];
                    })
                };
            })
        };
    });

    // const expectedResponse = response({}, 200);
    const getResellers = require('../functions/get-resellers-handler').getResellers;

    // Act
    const result = await getResellers();

    // Assert
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).length).toBe(2);
});
