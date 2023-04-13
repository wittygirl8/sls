const MerchantsProductsDescriptionList = [
    {
        id: '42323',
        productdescriptionId: '343423',
        merchantId: '543434',
        createdAt: '2020-07-01 06:53:31.0',
        updatedAt: '2020-07-01 06:53:31.0',
        deletedAt: null
    },
    {
        id: '34234-I8',
        productDescriptionId: '12334',
        merchantId: '6464',
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

let merchantProductDescriptionToUpdateDelete;

const MerchantProductDescriptionModel = {
    findByPk: (id) => {
        if (typeof id !== 'string') {
            throw new Error('Sql error');
        }

        if (options.isUpdateDeleteMode) {
            merchantProductDescriptionToUpdateDelete = MerchantsProductsDescriptionList.find(
                (entity) => entity.id == id
            );
            if (!merchantProductDescriptionToUpdateDelete) {
                return null;
            }
            return MerchantProductDescriptionModel;
        }
        return MerchantsProductsDescriptionList.find((entity) => entity.id === id);
    },
    findAll: () => {
        if (options.findAllError) {
            throw new Error('Sql error');
        }
        return MerchantsProductsDescriptionList;
    },
    create: (data) => {
        MerchantsProductsDescriptionList.push(data);
    },
    update: (updateData) => {
        const updatedEntity = { ...merchantProductDescriptionToUpdateDelete, ...updateData };
        const index = MerchantsProductsDescriptionList.indexOf(merchantProductDescriptionToUpdateDelete);
        MerchantsProductsDescriptionList[index] = updatedEntity;
    },
    destroy: (query) => {
        const where = query ? query.where : {};

        if (options.destroyError) {
            throw new Error('Destroy error');
        }
        if (where && where.merchantId) {
            const entities = MerchantsProductsDescriptionList.filter((m) => m.merchantId === where.merchantId);
            entities.forEach((element) => {
                const index = MerchantsProductsDescriptionList.indexOf(element);
                MerchantsProductsDescriptionList.splice(index, 1);
            });
            return;
        }
        const index = MerchantsProductsDescriptionList.indexOf(merchantProductDescriptionToUpdateDelete);
        MerchantsProductsDescriptionList.splice(index, 1);
    }
};

module.exports = {
    MerchantsProductsDescriptionList,
    setOptions,
    resetOptions,
    MerchantProductDescriptionModel
};
