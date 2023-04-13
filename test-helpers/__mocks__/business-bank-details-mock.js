const BusinessesBankDetails = [
    {
        id: '34236236236236236',
        sortCode: 123412,
        newAccountNumber: 42354324,
        accountHolderName: 'John',
        createdAt: '2020-07-01 06:53:31.0',
        updatedAt: '2020-07-01 06:53:31.0',
        deletedAt: null
    },
    {
        id: '4354234234',
        sortCode: 53231,
        newAccountNumber: 65435679,
        accountHolderName: 'Jack',
        createdAt: '2020-07-03 06:51:06.0',
        updatedAt: '2020-07-03 06:51:06.0',
        deletedAt: null
    },
    {
        id: '534623412',
        sortCode: 73213,
        newAccountNumber: 83456325,
        accountHolderName: 'Daniel',
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

let businessBankDetailsToUpdateDelete;

const BusinessBankDetailsModel = {
    findByPk: (id) => {
        if (typeof id !== 'string') {
            throw new Error('Sql error');
        }

        if (options.isUpdateDeleteMode) {
            businessBankDetailsToUpdateDelete = BusinessesBankDetails.find((entity) => entity.id == id);
            if (!businessBankDetailsToUpdateDelete) {
                return null;
            }
            return BusinessBankDetailsModel;
        }
        return BusinessesBankDetails.find((entity) => entity.id === id);
    },
    findAll: () => {
        if (options.findAllError) {
            throw new Error('Sql error');
        }
        return BusinessesBankDetails;
    },
    findOne: (query) => {
        if (options.isUpdateDeleteMode) {
            businessBankDetailsToUpdateDelete = BusinessesBankDetails.find(
                (business) => business.id === query.where.id
            );
            if (!businessBankDetailsToUpdateDelete) {
                return null;
            }
            return BusinessBankDetailsModel;
        }

        return BusinessesBankDetails.find((entity) => {
            if (query.where.id) {
                return entity.id === query.where.id;
            }
            return true;
        });
    },
    create: (data) => {
        BusinessesBankDetails.push(data);
    },
    update: (updateData) => {
        const updatedBusinessBankDetails = { ...businessBankDetailsToUpdateDelete, ...updateData };
        const index = BusinessesBankDetails.indexOf(businessBankDetailsToUpdateDelete);
        BusinessesBankDetails[index] = updatedBusinessBankDetails;
    },
    destroy: () => {
        if (options.destroyError) {
            throw new Error('Sql error');
        }
        const index = BusinessesBankDetails.indexOf(businessBankDetailsToUpdateDelete);
        BusinessesBankDetails.splice(index, 1);
    }
};

module.exports = {
    BusinessesBankDetails,
    setOptions,
    resetOptions,
    BusinessBankDetailsModel
};
