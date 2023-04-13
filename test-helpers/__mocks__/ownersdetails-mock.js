const OwnersDetailsList = [
    {
        id: '748544785412',
        title: 'Mr',
        fullName: 'Bill Gates',
        nationality: 'United States',
        birthDate: '1988-07-10',
        email: 'bill.gates@gmail.com',
        contactPhone: '+8852269',
        businessTitle: 'B2C',
        ownership: 50,
        ownershipType: 'Direct',
        ownerAddressId: '4643634656345'
    },
    {
        id: '996582215423',
        title: 'Miss',
        fullName: 'Angelina Murdur',
        nationality: 'United Kingdom',
        birthDate: '1994-04-22',
        email: 'angelina.murdurs@gmail.com',
        contactPhone: '+2235899',
        businessTitle: 'B2B',
        ownership: 27,
        ownershipType: 'Direct',
        ownerAddressId: '4643637776345'
    },
    {
        id: '885421121223',
        title: 'Ms',
        fullName: 'Cristiano Bergodi',
        nationality: 'Italy',
        birthDate: '1976-11-02',
        email: 'cristiano.bergodi@gmail.com',
        contactPhone: '+4475966',
        businessTitle: 'B2B',
        ownership: 70,
        ownershipType: 'Indirect',
        ownerAddressId: '7452322'
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
const setOwnersDetailsOptions = (opt) => {
    options = opt;
};

const resetOwnersDetailsOptions = () => {
    options.saveError = false;
    options.isUpdateDeleteMode = false;
    options.findAllError = false;
    options.findByPkError = false;
    options.destroyError = false;
    options.updateError = false;
    options.findOneEntityExists = false;
};

let ownersDetailsToUpdateDelete;

const OwnersDetailsModel = {
    findByPk: (id) => {
        if (typeof id !== 'string') {
            throw new Error('Sql error');
        }

        if (options.findByPkError) {
            throw new Error('DB error on findByPk');
        }

        if (options.isUpdateDeleteMode) {
            ownersDetailsToUpdateDelete = OwnersDetailsList.find((ownersDetail) => ownersDetail.id == id);
            if (!ownersDetailsToUpdateDelete) {
                return null;
            }
            return OwnersDetailsModel;
        }
        return OwnersDetailsList.find((ownersDetail) => ownersDetail.id === id);
    },
    findOne: (param) => {
        if (options.findOneEntityExists) {
            return OwnersDetailsList[0];
        }
        if (param.where.id) {
            if (options.isUpdateDeleteMode) {
                ownersDetailsToUpdateDelete = OwnersDetailsList.find(
                    (ownersDetail) => ownersDetail.id == param.where.id
                );
                if (!ownersDetailsToUpdateDelete) {
                    return null;
                }
                return OwnersDetailsModel;
            }
            return OwnersDetailsList.find((ownersDetail) => ownersDetail.id === param.where.id);
        }
        return null;
    },
    findAll: () => {
        if (options.findAllError) {
            throw new Error('Sql error');
        }
        return OwnersDetailsList;
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
        OwnersDetailsList.push(data);
    },
    update: (updateData) => {
        if (options.updateError) {
            throw new Error('DB exception on update');
        }
        const updatedOwnersDetails = { ...ownersDetailsToUpdateDelete, ...updateData };
        const index = OwnersDetailsList.indexOf(ownersDetailsToUpdateDelete);
        OwnersDetailsList[index] = updatedOwnersDetails;
    },
    destroy: () => {
        if (options.destroyError) {
            throw new Error('Sql error');
        }
        const index = OwnersDetailsList.indexOf(ownersDetailsToUpdateDelete);
        OwnersDetailsList.splice(index, 1);
    }
};

module.exports = {
    OwnersDetailsList,
    setOwnersDetailsOptions,
    resetOwnersDetailsOptions,
    OwnersDetailsModel
};
