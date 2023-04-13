const MerchantsProductsRequiredList = [
    {
        id: '64353453453',
        productRequiredId: '42342342',
        merchantId: '5343212',
        createdAt: '2020-07-01 06:53:31.0',
        updatedAt: '2020-07-01 06:53:31.0',
        deletedAt: null
    },
    {
        id: 'WwwuYAbZa6vN8smhNM-I8',
        productRequiredId: '4123123',
        merchantId: '5343212',
        createdAt: '2020-07-03 06:51:06.0',
        updatedAt: '2020-07-03 06:51:06.0',
        deletedAt: null
    },
    {
        id: '0Vn49hNM6BumthlsbPQ26',
        productRequiredId: '4123123',
        merchantId: '3123232',
        createdAt: '2020-07-03 07:10:00.0',
        updatedAt: '2020-07-03 07:10:00.0',
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

let merchantProductRequiredToUpdateDelete;

const MerchantProductRequiredModel = {
    findByPk: (id) => {
        if (typeof id !== 'string') {
            throw new Error('Sql error');
        }

        if (options.isUpdateDeleteMode) {
            merchantProductRequiredToUpdateDelete = MerchantsProductsRequiredList.find((entity) => entity.id == id);
            if (!merchantProductRequiredToUpdateDelete) {
                return null;
            }
            return MerchantProductRequiredModel;
        }
        return MerchantsProductsRequiredList.find((entity) => entity.id === id);
    },
    findAll: () => {
        if (options.findAllError) {
            throw new Error('Sql error');
        }
        return MerchantsProductsRequiredList;
    },
    findOne: (query) => {
        return MerchantsProductsRequiredList.find((entity) => {
            if (query.where.name) {
                return entity.name === query.where.name;
            }
            return true;
        });
    },
    create: (data) => {
        MerchantsProductsRequiredList.push(data);
    },
    update: (updateData) => {
        const updatedEntity = { ...merchantProductRequiredToUpdateDelete, ...updateData };
        const index = MerchantsProductsRequiredList.indexOf(merchantProductRequiredToUpdateDelete);
        MerchantsProductsRequiredList[index] = updatedEntity;
    },
    destroy: (query) => {
        const where = query ? query.where : {};

        if (options.destroyError) {
            throw new Error('Destroy error');
        }
        if (where && where.merchantId) {
            const entities = MerchantsProductsRequiredList.filter((m) => m.merchantId === where.merchantId);
            entities.forEach((element) => {
                const index = MerchantsProductsRequiredList.indexOf(element);
                MerchantsProductsRequiredList.splice(index, 1);
            });
            return;
        }
        const index = MerchantsProductsRequiredList.indexOf(merchantProductRequiredToUpdateDelete);
        MerchantsProductsRequiredList.splice(index, 1);
    }
};

module.exports = {
    MerchantsProductsRequiredList,
    setOptions,
    resetOptions,
    MerchantProductRequiredModel
};
