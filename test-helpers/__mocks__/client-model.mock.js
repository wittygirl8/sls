let defaultList = [
    {
        id: 6689316860615196672,
        name: '46464645',
        description: null,
        business_id: 6689316804302471168,
        created_at: '2020-07-15 23:57:01.0',
        updated_at: '2020-07-15 23:57:01.0',
        deleted_at: null
    },
    {
        id: 6689415036118499328,
        name: 'Client 1',
        description: null,
        business_id: 6689414967050895360,
        created_at: '2020-07-16 06:27:07.0',
        updated_at: '2020-07-16 09:38:47.0',
        deleted_at: '2020-07-16 09:38:47.0'
    },
    {
        id: 6689433825111441408,
        name: 'Client 2 from firefox',
        description: null,
        business_id: 6689414967050895360,
        created_at: '2020-07-16 07:41:47.0',
        updated_at: '2020-07-16 09:38:56.0',
        deleted_at: '2020-07-16 09:38:56.0'
    },
    {
        id: 6689433885454893056,
        name: 'Client 3 from firefox Enter button',
        description: null,
        business_id: 6689414967050895360,
        created_at: '2020-07-16 07:42:01.0',
        updated_at: '2020-07-16 09:39:04.0',
        deleted_at: '2020-07-16 09:39:04.0'
    },
    {
        id: 6689463452823453696,
        name: 'Client 1',
        description: null,
        business_id: 6689414967050895360,
        created_at: '2020-07-16 09:39:31.0',
        updated_at: '2020-07-22 12:09:24.0',
        deleted_at: '2020-07-22 12:09:24.0'
    }
];

const ClientList = defaultList;

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
const setClientOptions = (opt) => {
    options = opt;
};

const resetClientOptions = () => {
    options.saveError = false;
    options.isUpdateDeleteMode = false;
    options.findAllError = false;
    options.findByPkError = false;
    options.destroyError = false;
    options.updateError = false;
    options.findOneEntityExists = false;
    defaultList = [
        {
            id: 6689316860615196672,
            name: '46464645',
            description: null,
            business_id: 6689316804302471168,
            created_at: '2020-07-15 23:57:01.0',
            updated_at: '2020-07-15 23:57:01.0',
            deleted_at: null
        },
        {
            id: 6689415036118499328,
            name: 'Client 1',
            description: null,
            business_id: 6689414967050895360,
            created_at: '2020-07-16 06:27:07.0',
            updated_at: '2020-07-16 09:38:47.0',
            deleted_at: '2020-07-16 09:38:47.0'
        },
        {
            id: 6689433825111441408,
            name: 'Client 2 from firefox',
            description: null,
            business_id: 6689414967050895360,
            created_at: '2020-07-16 07:41:47.0',
            updated_at: '2020-07-16 09:38:56.0',
            deleted_at: '2020-07-16 09:38:56.0'
        },
        {
            id: 6689433885454893056,
            name: 'Client 3 from firefox Enter button',
            description: null,
            business_id: 6689414967050895360,
            created_at: '2020-07-16 07:42:01.0',
            updated_at: '2020-07-16 09:39:04.0',
            deleted_at: '2020-07-16 09:39:04.0'
        },
        {
            id: 6689463452823453696,
            name: 'Client 1',
            description: null,
            business_id: 6689414967050895360,
            created_at: '2020-07-16 09:39:31.0',
            updated_at: '2020-07-22 12:09:24.0',
            deleted_at: '2020-07-22 12:09:24.0'
        }
    ];
};

let clientToUpdateDelete;

const ClientModel = {
    findByPk: (id) => {
        if (typeof id !== 'string') {
            throw new Error('Sql error');
        }

        if (options.findByPkError) {
            throw new Error('DB error on findByPk');
        }

        if (options.isUpdateDeleteMode) {
            clientToUpdateDelete = ClientList.find((client) => client.id == id);
            if (!clientToUpdateDelete) {
                return null;
            }
            return ClientModel;
        }
        return ClientList.find((client) => client.id === id);
    },
    findOne: (param) => {
        if (options.findOneEntityExists) {
            return ClientList[0];
        }
        if (param.where.id) {
            if (options.isUpdateDeleteMode) {
                clientToUpdateDelete = ClientList.find((client) => client.id == param.where.id);
                if (!clientToUpdateDelete) {
                    return null;
                }
                return ClientModel;
            }
            return ClientList.find((client) => client.id === param.where.id);
        }
        return null;
    },
    findAll: () => {
        if (options.findAllError) {
            throw new Error('Sql error');
        }
        return ClientList;
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
        ClientList.push(data);
    },
    update: (updateData) => {
        if (options.updateError) {
            throw new Error('DB exception on update');
        }
        const updatedClient = { ...clientToUpdateDelete, ...updateData };
        const index = ClientList.indexOf(clientToUpdateDelete);
        ClientList[index] = updatedClient;
    },
    destroy: () => {
        if (options.destroyError) {
            throw new Error('Sql error');
        }
        const index = ClientList.indexOf(clientToUpdateDelete);
        ClientList.splice(index, 1);
    }
};

module.exports = {
    ClientList,
    setClientOptions,
    resetClientOptions,
    ClientModel
};
