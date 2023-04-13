const ProductDescriptions = [
    {
        id: '6431241241',
        name: 'Dry Cleaners',
        createdAt: '2020-08-30 09:08:23.0',
        updatedAt: '2020-08-30 09:08:23.0'
    },
    {
        id: '75243241',
        name: 'Electrical Parts and Equitment',
        createdAt: '2019-08-30 09:08:23.0',
        updatedAt: '2019-08-30 09:08:23.0'
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

const ProductDescriptionModel = {
    findAll: () => {
        if (options.findAllError) {
            throw new Error('Sql error');
        }
        return ProductDescriptions;
    },
    create: (data) => {
        if (options.saveError) {
            throw new Error('DB exception on save');
        }
        ProductDescriptions.push(data);
    }
};

module.exports = {
    ProductDescriptions,
    ProductDescriptionModel,
    setOptions,
    resetOptions
};
