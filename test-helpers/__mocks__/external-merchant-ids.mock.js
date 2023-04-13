const ExternalMerchantIdsList = [
    {
        id: '8885412254',
        merchantId: '888552214',
        index: 0,
        externalMerchantId: '3362225412',
        externalMerchantStoreId: null
    },
    {
        id: '8884454',
        merchantId: '84414',
        index: 0,
        externalMerchantId: '33772',
        externalMerchantStoreId: null
    },
    {
        id: '8884',
        merchantId: '888224',
        index: 0,
        externalMerchantId: null,
        externalMerchantStoreId: '885112452'
    }
];

/**
 * @type {{
 * isUpdateDeleteMode: boolean
 * findAllError: boolean
 * findByPkError: boolean
 * destroyError: boolean
 * saveError: boolean
 * updateError: boolean
 * findOneEntityExists: boolean
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
 * findOneEntityExists: boolean
 * }} opt
 */
const setExternalMerchantIdsOptions = (opt) => {
    options = opt;
};

const resetExternalMerchantIdsOptions = () => {
    options.saveError = false;
    options.isUpdateDeleteMode = false;
    options.findAllError = false;
    options.findByPkError = false;
    options.destroyError = false;
    options.updateError = false;
    options.findOneEntityExists = false;
};

let externalMerchantIdsToUpdateDelete;

const ExternalMerchantIdsModel = {
    findByPk: (id) => {
        if (typeof id !== 'string') {
            throw new Error('Sql error');
        }

        if (options.findByPkError) {
            throw new Error('DB error on findByPk');
        }

        if (options.isUpdateDeleteMode) {
            externalMerchantIdsToUpdateDelete = ExternalMerchantIdsList.find(
                (externalMerchantId) => externalMerchantId.id == id
            );
            if (!externalMerchantIdsToUpdateDelete) {
                return null;
            }
            return ExternalMerchantIdsModel;
        }
        return ExternalMerchantIdsList.find((externalMerchantId) => externalMerchantId.id === id);
    },
    findOne: (param) => {
        if (options.findOneEntityExists) {
            return ExternalMerchantIdsList[0];
        }
        if (param.where.id) {
            if (options.isUpdateDeleteMode) {
                externalMerchantIdsToUpdateDelete = ExternalMerchantIdsList.find(
                    (externalMerchantId) => externalMerchantId.id === param.where.id
                );
                if (!externalMerchantIdsToUpdateDelete) {
                    return null;
                }
                return ExternalMerchantIdsModel;
            }
            return ExternalMerchantIdsList.find((externalMerchantId) => externalMerchantId.id === param.where.id);
        }
        return null;
    },
    findAll: () => {
        if (options.findAllError) {
            throw new Error('Sql error');
        }
        return ExternalMerchantIdsList;
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
        ExternalMerchantIdsList.push(data);
    },
    update: (updateData) => {
        if (options.updateError) {
            throw new Error('DB exception on update');
        }
        const updatedExternalMerchantIds = { ...externalMerchantIdsToUpdateDelete, ...updateData };
        const index = ExternalMerchantIdsList.indexOf(externalMerchantIdsToUpdateDelete);
        ExternalMerchantIdsList[index] = updatedExternalMerchantIds;
    },
    delete: () => {
        if (options.destroyError) {
            throw new Error('Sql error');
        }
        const index = ExternalMerchantIdsList.indexOf(externalMerchantIdsToUpdateDelete);
        ExternalMerchantIdsList.splice(index, 1);
    }
};

module.exports = {
    ExternalMerchantIdsList,
    setExternalMerchantIdsOptions,
    resetExternalMerchantIdsOptions,
    ExternalMerchantIdsModel
};
