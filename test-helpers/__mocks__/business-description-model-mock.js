const BusinessDescriptions = [
    {
        id: '756474245343',
        name: 'Motor vehicle',
        createdAt: '2020-08-30 09:08:23.0',
        updatedAt: '2020-08-30 09:08:23.0'
    },
    {
        id: '35423423434',
        name: 'Cosmetic Stores',
        createdAt: '2019-08-30 09:08:23.0',
        updatedAt: '2019-08-30 09:08:23.0'
    },
    {
        id: '82332423434',
        name: 'Book Stores',
        createdAt: '2018-08-30 09:08:23.0',
        updatedAt: '2018-08-30 09:08:23.0'
    }
];

/**
 * @type {{
 * findAllError: boolean
 * saveError: boolean
 * }} options
 */
let options = {};

/**
 *
 * @param {{
 * findAllError: boolean
 * saveError: boolean
 * }} opt
 */
const setOptions = (opt) => {
    options = opt;
};

const resetOptions = () => {
    options.saveError = false;
    options.findAllError = false;
};

const BusinessDescriptionModel = {
    findAll: () => {
        if (options.findAllError) {
            throw new Error('Sql error');
        }
        return BusinessDescriptions;
    },
    create: (data) => {
        if (options.saveError) {
            throw new Error('DB exception on save');
        }
        BusinessDescriptions.push(data);
    }
};

module.exports = {
    BusinessDescriptions,
    BusinessDescriptionModel,
    setOptions,
    resetOptions
};
