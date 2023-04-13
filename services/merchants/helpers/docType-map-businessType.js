const MerchantCountries = {
    UNITED_KINGDOM: 'United Kingdom',
    IRELAND: 'Ireland',
    AUSTRALIA: 'Australia',
    NEW_ZEALAND: 'New Zealand',
    CANADA: 'Canada',
    UNITED_STATES: 'United States',
    MEXICO: 'Mexico',
    ANGUILLA: 'Anguilla',
    NIGERIA: 'Nigeria'
};

const commonDocType = {
    1: {
        bankDocType: [1, 8],
        idDocType: [3, 4, 6]
    },
    2: {
        bankDocType: [1, 8],
        idDocType: [3, 4, 6],
        addressDocType: [7, 5, 2]
    },
    5: {
        bankDocType: [1, 8],
        idDocType: [3, 4, 6],
        addressDocType: [7, 5, 2]
    },
    9: {
        bankDocType: [1, 8],
        idDocType: [3, 4, 6],
        addressDocType: [7, 5, 2]
    }
};
export const DocumentsCategoriesCountryWise = {
    [MerchantCountries.UNITED_KINGDOM]: {
        ...commonDocType
    },
    [MerchantCountries.UNITED_STATES]: {
        ...commonDocType
    },
    [MerchantCountries.MEXICO]: {
        1: {
            bankDocType: [1],
            idDocType: [9, 10]
        },
        2: {
            bankDocType: [1],
            idDocType: [9, 10],
            addressDocType: [7, 5, 2]
        }
    },
    [MerchantCountries.CANADA]: {
        1: {
            bankDocType: [1],
            idDocType: [9, 10],
            addressDocType: [11]
        },
        2: {
            bankDocType: [1],
            idDocType: [9, 10]
        }
    },
    [MerchantCountries.NEW_ZEALAND]: {
        ...commonDocType
    },

    [MerchantCountries.AUSTRALIA]: {
        ...commonDocType
    },
    [MerchantCountries.IRELAND]: {
        ...commonDocType
    },
    [MerchantCountries.ANGUILLA]: {
        ...commonDocType
    },
    [MerchantCountries.NIGERIA]: {
        ...commonDocType
    }
};
