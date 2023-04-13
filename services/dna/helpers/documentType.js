export const DocumentTypesId = {
    BANK_STATEMENT: 1,
    BUSINESS_RATES_BILL: 2,
    DRIVING_LICENCE: 3,
    PASSPORT: 4,
    RENTAL_AGREEMENT: 5,
    RESIDENCY_PERMIT: 6,
    UTILITY_BILL: 7,
    VOID_CHEQUE: 8,
    ID_PROOF_FRONT: 9,
    ID_PROOF_BACK: 10,
    BUSINESS_REGISTRATION_CERTIFICATE: 11
};

export const DocumentTypesIdToName = {
    1: 'BANK_STATEMENT',
    3: 'DRIVING_LICENCE_FRONT',
    4: 'PASSPORT',
    8: 'BANK_STATEMENT',
    9: 'ID_CARD_FRONT',
    10: 'ID_CARD_BACK'
};

export const DatmanDocumentTypesIdToName = {
    1: 'BANK_STATEMENT',
    3: 'DRIVING_LICENCE',
    4: 'PASSPORT',
    8: 'VOID_CHEQUE',
    9: 'ID_PROOF_FRONT',
    10: 'ID_PROOF_BACK'
};

export const DnaDocumentTypes = {
    BANK_STATEMENT: 'poa_personal_bank_statement',
    DRIVING_LICENCE: 'id_driving_licence',
    PASSPORT: 'id_passport',
    UTILITY_BILL: 'residential_utility_bill',
    VOID_CHEQUE: 'pob_cheque_book',
    OTHER: 'other'
};
