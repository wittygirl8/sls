const BusinessDetailList = [
    {
        id: '58678679789789',
        businessTypeId: '87979789870808970',
        registeredNumber: 'Registered number 1',
        vatNumber: 'Vat 1',
        tradingName: 'Trade 1',
        phoneNumber: '+373666666',
        websiteUrl: 'alo.md'
    },
    {
        id: '6798579879797897',
        businessTypeId: '123424234234234',
        registeredNumber: 'Registered number 2',
        vatNumber: 'Vat 2',
        tradingName: 'Trade 2',
        phoneNumber: '+373777777',
        websiteUrl: 'mail.md'
    },
    {
        id: '360470560780678',
        businessTypeId: '9753242423',
        registeredNumber: 'Registered number 3',
        vatNumber: 'Vat 3',
        tradingName: 'Trade 3',
        phoneNumber: '+3738888888',
        websiteUrl: 'cosmos.md'
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
const setBusinessDetailOptions = (opt) => {
    options = opt;
};

const resetBusinessDetailOptions = () => {
    options.saveError = false;
    options.isUpdateDeleteMode = false;
    options.findAllError = false;
    options.findByPkError = false;
    options.destroyError = false;
    options.updateError = false;
    options.findOneEntityExists = false;
};

let businessDetailToUpdateDelete;

const BusinessDetailModel = {
    findByPk: (id) => {
        if (typeof id !== 'string') {
            throw new Error('Sql error');
        }

        if (options.findByPkError) {
            throw new Error('DB error on findByPk');
        }

        if (options.isUpdateDeleteMode) {
            businessDetailToUpdateDelete = BusinessDetailList.find((businessDetail) => businessDetail.id == id);
            if (!businessDetailToUpdateDelete) {
                return null;
            }
            return BusinessDetailModel;
        }
        return BusinessDetailList.find((businessDetail) => businessDetail.id === id);
    },
    findOne: (param) => {
        if (options.findOneEntityExists) {
            return BusinessDetailList[0];
        }
        if (param.where.id) {
            if (options.isUpdateDeleteMode) {
                businessDetailToUpdateDelete = BusinessDetailList.find(
                    (businessDetail) => businessDetail.id === param.where.id
                );
                if (!businessDetailToUpdateDelete) {
                    return null;
                }
                return BusinessDetailModel;
            }
            return BusinessDetailList.find((businessDetail) => businessDetail.id === param.where.id);
        }
        return null;
    },
    findAll: () => {
        if (options.findAllError) {
            throw new Error('Sql error');
        }
        return BusinessDetailList;
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
        BusinessDetailList.push(data);
    },
    update: (updateData) => {
        if (options.updateError) {
            throw new Error('DB exception on update');
        }

        const updatedBusinessDetail = assignDefined(businessDetailToUpdateDelete, updateData);
        const index = BusinessDetailList.indexOf(businessDetailToUpdateDelete);
        BusinessDetailList[index] = updatedBusinessDetail;
    },
    destroy: () => {
        if (options.destroyError) {
            throw new Error('Sql error');
        }
        const index = BusinessDetailList.indexOf(businessDetailToUpdateDelete);
        BusinessDetailList.splice(index, 1);
    }
};

function assignDefined(target, source) {
    Object.keys(source).map((key) => {
        if (source[key] !== undefined) {
            target[key] = source[key];
        }
    });

    return target;
}

module.exports = {
    BusinessDetailList,
    setBusinessDetailOptions,
    resetBusinessDetailOptions,
    BusinessDetailModel
};
