const MerchantList = [
    {
        id: 'V1StGXR8_Z5jdHi6B-myT',
        name: 'Merchant 1',
        description: null,
        createdAt: '2020-07-10 06:53:31.0',
        updatedAt: '2020-07-10 06:53:31.0',
        deletedAt: null
    },
    {
        id: 'fB14Mlydr9Fod8tApvjCd',
        name: 'Merchant 2',
        description: null,
        createdAt: '2020-07-12 06:51:06.0',
        updatedAt: '2020-07-12 06:51:06.0',
        deletedAt: null
    },
    {
        id: 'M2seg7a0QGKfg2XUuA3P6',
        name: 'Merchant 3',
        description: null,
        createdAt: '2020-07-15 07:10:00.0',
        updatedAt: '2020-07-15 07:10:00.0',
        deletedAt: null
    }
];

/**
 * @type {{
 * isUpdateDeleteMode: boolean
 * findAllError: boolean
 * destroyError: boolean
 * saveError: boolean
 * }} options
 */
let options = {};

/**
 *
 * @param {{
 * isUpdateDeleteMode: boolean
 * findAllError: boolean
 * findByPkError: boolean
 * destroyError: boolean
 * saveError: boolean
 * updateError: boolean
 * }} opt
 */
const setMerchantOptions = (opt) => {
    options = opt;
};

const resetMerchantOptions = () => {
    options.saveError = false;
    options.isUpdateDeleteMode = false;
    options.findAllError = false;
    options.findByPkError = false;
    options.destroyError = false;
    options.updateError = false;
    options.findOneEntityExists = false;
};

let merchantToUpdateDelete;

const MerchantModel = {
    findByPk: (id) => {
        if (typeof id !== 'string') {
            throw new Error('Sql error');
        }

        if (options.findByPkError) {
            throw new Error('DB error on findByPk');
        }

        if (options.isUpdateDeleteMode) {
            merchantToUpdateDelete = MerchantList.find((merchant) => merchant.id == id);
            if (!merchantToUpdateDelete) {
                return null;
            }
            return MerchantModel;
        }
        return MerchantList.find((merchant) => merchant.id === id);
    },
    findOne: (param) => {
        if (options.findOneEntityExists) {
            return MerchantList[0];
        }
        if (param.where.id) {
            if (options.isUpdateDeleteMode) {
                merchantToUpdateDelete = MerchantList.find((merchant) => merchant.id == param.where.id);
                if (!merchantToUpdateDelete) {
                    return null;
                }
                return MerchantModel;
            }
            return MerchantList.find((merchant) => merchant.id === param.where.id);
        }
        return null;
    },
    findAll: () => {
        if (options.findAllError) {
            throw new Error('Sql error');
        }
        return MerchantList;
    },
    findAllOnlyId: () => {
        if (options.findAllError) {
            throw new Error('Sql error');
        }
        return MerchantList;
    },
    count: () => {
        if (options.findOneEntityExists) {
            return 1;
        }
        return 0;
    },
    create: (data) => {
        if (options.saveError) {
            throw new Error('DB exception on save');
        }
        MerchantList.push(data);
        return data;
    },
    update: (updateData) => {
        if (options.updateError) {
            throw new Error('DB exception on update');
        }
        const updatedMerchant = { ...merchantToUpdateDelete, ...updateData };
        const index = MerchantList.indexOf(merchantToUpdateDelete);
        MerchantList[index] = updatedMerchant;
    },
    destroy: () => {
        if (options.destroyError) {
            throw new Error('Sql error');
        }
        const index = MerchantList.indexOf(merchantToUpdateDelete);
        MerchantList.splice(index, 1);
    }
};

module.exports = {
    MerchantList,
    setMerchantOptions,
    resetMerchantOptions,
    MerchantModel
};
