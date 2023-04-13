const MerchantsBusinessDescriptionList = [
    {
        id: '42323',
        businessdescriptionId: '423423',
        merchantId: '123123',
        createdAt: '2020-07-01 06:53:31.0',
        updatedAt: '2020-07-01 06:53:31.0',
        deletedAt: null
    },
    {
        id: '34234-I8',
        businessDescriptionId: '53423',
        merchantId: '12342',
        createdAt: '2020-07-03 06:51:06.0',
        updatedAt: '2020-07-03 06:51:06.0',
        deletedAt: null
    }
];

/**
 * @type {{
 * isUpdateDeleteMode: boolean
 * findAllError: boolean
 * destroyError: boolean
 * }} options
 */
let options = {};

/**
 *
 * @param {{
 * isUpdateDeleteMode: boolean
 * findAllError: boolean
 * destroyError: boolean
 * }} opt
 */
function setOptions(opt) {
    options = opt;
}

function resetOptions() {
    options = {};
}

let merchantBusinessDescriptionToUpdateDelete;

const MerchantBuisnessDescriptionModel = {
    findByPk: (id) => {
        if (typeof id !== 'string') {
            throw new Error('Sql error');
        }

        if (options.isUpdateDeleteMode) {
            merchantBusinessDescriptionToUpdateDelete = MerchantsBusinessDescriptionList.find(
                (entity) => entity.id == id
            );
            if (!merchantBusinessDescriptionToUpdateDelete) {
                return null;
            }
            return MerchantBuisnessDescriptionModel;
        }
        return MerchantsBusinessDescriptionList.find((entity) => entity.id === id);
    },
    findAll: () => {
        if (options.findAllError) {
            throw new Error('Sql error');
        }
        return MerchantsBusinessDescriptionList;
    },
    create: (data) => {
        MerchantsBusinessDescriptionList.push(data);
    },
    update: (updateData) => {
        const updatedEntity = { ...merchantBusinessDescriptionToUpdateDelete, ...updateData };
        const index = MerchantsBusinessDescriptionList.indexOf(merchantBusinessDescriptionToUpdateDelete);
        MerchantsBusinessDescriptionList[index] = updatedEntity;
    },
    destroy: (query) => {
        const where = query ? query.where : {};

        if (options.destroyError) {
            throw new Error('Destroy error');
        }
        if (where && where.merchantId) {
            const entities = MerchantsBusinessDescriptionList.filter((m) => m.merchantId === where.merchantId);
            entities.forEach((element) => {
                const index = MerchantsBusinessDescriptionList.indexOf(element);
                MerchantsBusinessDescriptionList.splice(index, 1);
            });
            return;
        }
        const index = MerchantsBusinessDescriptionList.indexOf(merchantBusinessDescriptionToUpdateDelete);
        MerchantsBusinessDescriptionList.splice(index, 1);
    }
};

module.exports = {
    MerchantsBusinessDescriptionList,
    setOptions,
    resetOptions,
    MerchantBuisnessDescriptionModel
};
