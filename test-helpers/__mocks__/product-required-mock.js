const ProductsRequired = [
    {
        id: '646356325',
        name: 'Gateway',
        description: 'desc 1',
        createdAt: '2020-08-30 09:08:23.0',
        updatedAt: '2020-08-30 09:08:23.0'
    },
    {
        id: '865754',
        name: 'Virtual Terminal',
        description: 'desc 2',
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

const ProductRequiredModel = {
    findAll: () => {
        if (options.findAllError) {
            throw new Error('Sql error');
        }
        return ProductsRequired;
    },
    create: (data) => {
        if (options.saveError) {
            throw new Error('DB exception on save');
        }
        ProductsRequired.push(data);
    }
};

module.exports = {
    ProductsRequired,
    ProductRequiredModel,
    setOptions,
    resetOptions
};
