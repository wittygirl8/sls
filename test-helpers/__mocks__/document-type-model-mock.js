const DocumentTypes = [
    {
        id: '1',
        name: 'Bank Statement',
        createdAt: '2020-06-29 12:26:58.0',
        updatedAt: '2020-06-29 12:26:58.0'
    },
    {
        id: '2',
        name: 'Business Rates Bill',
        createdAt: '2020-06-29 12:26:58.0',
        updatedAt: '2020-06-29 12:26:58.0'
    },
    {
        id: '3',
        name: 'Driving License',
        createdAt: '2020-06-29 12:26:58.0',
        updatedAt: '2020-06-29 12:26:58.0'
    }
];

/**
 * @type {{
 * findAllError: boolean
 * }} options
 */
let options = {};

/**
 *
 * @param {{
 * findAllError: boolean
 * }} opt
 */
const setOptions = (opt) => {
    options = opt;
};

const resetOptions = () => {
    options.findAllError = false;
};

const DocumentTypeModel = {
    findAll: () => {
        if (options.findAllError) {
            throw new Error('Sql error');
        }
        return DocumentTypes;
    }
};

module.exports = {
    DocumentTypes,
    DocumentTypeModel,
    setOptions,
    resetOptions
};
