import { MerchantCountries } from './MerchantCountries';

export const getCountryCurrencySymbol = (country) => {
    switch (country) {
        case MerchantCountries.UNITED_KINGDOM:
            return '\u00A3';
        case MerchantCountries.UNITED_STATES:
            return '\u0024';
        case MerchantCountries.CANADA:
            return '\u0024';
        case MerchantCountries.AUSTRALIA:
            return '\u0024';
        case MerchantCountries.NEW_ZEALAND:
            return '\u0024';
        case MerchantCountries.IRELAND:
            return '\u20AC';
        case MerchantCountries.MEXICO:
            return '\u0024';
        case MerchantCountries.ANGUILLA:
            return '\u0024';
        case MerchantCountries.INDIA:
            return '\u20b9';
        case MerchantCountries.NIGERIA:
            return '\u20A6';
        default:
            return '\u20AC';
    }
};
