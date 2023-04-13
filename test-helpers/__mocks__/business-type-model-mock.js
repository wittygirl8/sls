const BusinessTypes = [
    {
        id: '6689812938011705346',
        name: 'LLC',
        createdAt: '2020-06-29 12:26:58.0',
        updatedAt: '2020-06-29 12:26:58.0'
    },
    {
        id: '6689812938011705348',
        name: 'PLC',
        createdAt: '2020-07-01 12:38:23.0',
        updatedAt: '2020-07-01 12:38:23.0'
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

const BusinessTypeModel = {
    findAll: () => {
        if (options.findAllError) {
            throw new Error('Sql error');
        }
        return BusinessTypes;
    },
    create: (data) => {
        if (options.saveError) {
            throw new Error('DB exception on save');
        }
        BusinessTypes.push(data);
    }
};

module.exports = {
    BusinessTypes,
    BusinessTypeModel,
    setOptions,
    resetOptions
};
