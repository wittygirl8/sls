// Datman onboarding
// in name and address index [0..3] --> business details table
//                     index[4] -->  business bank detail table
//                     index[5...] --> address table
// in bank details all indexes --> business bank detail table
// in trading address index[0] --> business details table
//                    index[1...] --> address table
// in owner details index[0,5] (in case of mexico [0,6])  --> owner details table
//                  index[6...] (in case of mexico [7 ...]) --> address table

const step1CommonFields = [
    'businessTypeId',
    'phoneNumber',
    'email',
    'legalName',
    'addressLine1',
    'city',
    'postCode',
    'country'
];

const step3CommonFields = ['addressLine1', 'city', 'postCode', 'country'];
const step4CommonFields = [
    'contactTel',
    'email',
    'fullName',
    'nationality',
    'title',
    'dateOfBirth',
    'addressLine1',
    'city',
    'postCode',
    'country'
];

export const defaultSoleTraderStep = ['businessTypeId', 'phoneNumber', 'email'];
export const registeredBusinessSoleTraderStep = ['businessTypeId', 'phoneNumber', 'email', 'tradingName'];
export const notRegBankAccountSoleTraderStep = ['businessTypeId', 'phoneNumber', 'email', 'accountHolderName'];
export const tradingAddressSoleTrader = [...step3CommonFields];

export const onboardingRequiredFields = {
    Datman: [
        {
            country: 'United Kingdom',
            steps: {
                nameAndAddressFields: [...step1CommonFields, 'registeredNumber'],
                bankDetailsFields: ['accountHolderName', 'sortCode', 'newAccountNumber'],
                tradingAddressFields: [...step3CommonFields, 'tradingName'],
                ownerDetailsFields: [...step4CommonFields]
            }
        },
        {
            country: 'United States',
            steps: {
                nameAndAddressFields: [...step1CommonFields],
                bankDetailsFields: ['accountHolderName', 'routingNumber', 'newAccountNumber', 'nameOfBank'],
                tradingAddressFields: [...step3CommonFields, 'tradingName'],
                ownerDetailsFields: [...step4CommonFields]
            }
        },
        {
            country: 'Canada',
            steps: {
                nameAndAddressFields: [...step1CommonFields],
                bankDetailsFields: [
                    'accountHolderName',
                    'transitNumber',
                    'financialInstitutionNumber',
                    'newAccountNumber'
                ],
                tradingAddressFields: [...step3CommonFields, 'tradingName'],
                ownerDetailsFields: [...step4CommonFields]
            }
        },
        {
            country: 'Ireland',
            steps: {
                nameAndAddressFields: [...step1CommonFields],
                bankDetailsFields: [
                    'accountHolderName',
                    'newAccountNumber',
                    'nameOfBank',
                    'bankAddress1',
                    'bankAddress2'
                ],
                tradingAddressFields: [...step3CommonFields, 'tradingName'],
                ownerDetailsFields: [...step4CommonFields]
            }
        },
        {
            country: 'New Zealand',
            steps: {
                nameAndAddressFields: [...step1CommonFields, 'registeredNumber'],
                bankDetailsFields: ['accountHolderName', 'newAccountNumber', 'nameOfBank'],
                tradingAddressFields: [...step3CommonFields, 'tradingName'],
                ownerDetailsFields: [...step4CommonFields]
            }
        },
        {
            country: 'Mexico',
            steps: {
                nameAndAddressFields: [...step1CommonFields, 'state'],
                bankDetailsFields: ['accountHolderName', 'newAccountNumber'],
                tradingAddressFields: [...step3CommonFields, 'state', 'tradingName'],
                ownerDetailsFields: ['personalId', ...step4CommonFields, 'state']
            }
        },
        {
            country: 'Australia',
            steps: {
                nameAndAddressFields: [...step1CommonFields],
                bankDetailsFields: ['accountHolderName', 'bsb', 'newAccountNumber', 'nameOfBank'],
                tradingAddressFields: [...step3CommonFields, 'tradingName'],
                ownerDetailsFields: [...step4CommonFields]
            }
        }
    ]
};
