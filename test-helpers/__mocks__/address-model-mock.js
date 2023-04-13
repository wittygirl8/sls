const AddressesList = [
    {
        id: '352634436534',
        postCode: '4813',
        phoneNumber: '+232412131',
        addressLine1: 'str 11',
        addressLine2: 'str 12',
        city: 'Chisinau',
        country: 'Moldova'
    },
    {
        id: '4643634656345',
        postCode: '1334',
        phoneNumber: '+3523131',
        addressLine1: 'str 21',
        addressLine2: 'str 22',
        city: 'Iasi',
        country: 'Romania'
    },
    {
        id: '7452322',
        postCode: '7675',
        phoneNumber: '+844252',
        addressLine1: 'str 31',
        addressLine2: 'str 32',
        city: 'London',
        country: 'United Kingdom'
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
const setAddressOptions = (opt) => {
    options = opt;
};

const resetAddressOptions = () => {
    options.saveError = false;
    options.isUpdateDeleteMode = false;
    options.findAllError = false;
    options.findByPkError = false;
    options.destroyError = false;
    options.updateError = false;
    options.findOneEntityExists = false;
};

let addressToUpdateDelete;

const AddressModel = {
    findByPk: (id) => {
        if (typeof id !== 'string') {
            throw new Error('Sql error');
        }

        if (options.findByPkError) {
            throw new Error('DB error on findByPk');
        }

        if (options.isUpdateDeleteMode) {
            addressToUpdateDelete = AddressesList.find((address) => address.id == id);
            if (!addressToUpdateDelete) {
                return null;
            }
            return AddressModel;
        }
        return AddressesList.find((address) => address.id === id);
    },
    findOne: (param) => {
        if (options.findOneEntityExists) {
            return AddressesList[0];
        }
        if (param.where.id) {
            if (options.isUpdateDeleteMode) {
                addressToUpdateDelete = AddressesList.find((address) => address.id == param.where.id);
                if (!addressToUpdateDelete) {
                    return null;
                }
                return AddressModel;
            }
            return AddressesList.find((address) => address.id === param.where.id);
        }
        return null;
    },
    findAll: () => {
        if (options.findAllError) {
            throw new Error('Sql error');
        }
        return AddressesList;
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
        AddressesList.push(data);
    },
    update: (updateData) => {
        if (options.updateError) {
            throw new Error('DB exception on update');
        }
        const updatedAddress = { ...addressToUpdateDelete, ...updateData };
        const index = AddressesList.indexOf(addressToUpdateDelete);
        AddressesList[index] = updatedAddress;
    },
    destroy: () => {
        if (options.destroyError) {
            throw new Error('Sql error');
        }
        const index = AddressesList.indexOf(addressToUpdateDelete);
        AddressesList.splice(index, 1);
    }
};

module.exports = {
    AddressesList,
    setAddressOptions,
    resetAddressOptions,
    AddressModel
};
