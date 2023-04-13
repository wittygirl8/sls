const ResellerList = [
    {
        id: 748,
        portalUrl: 'portal_1'
    },
    {
        id: 996,
        portalUrl: 'portal_2'
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
const setResellerOptions = (opt) => {
    options = opt;
};

const resetResellerOptions = () => {
    options.saveError = false;
    options.isUpdateDeleteMode = false;
    options.findAllError = false;
    options.findByPkError = false;
    options.destroyError = false;
    options.updateError = false;
    options.findOneEntityExists = false;
};

let resellerToUpdateDelete;

const ResellerModel = {
    findOne: (param) => {
        if (options.findAllError) {
            throw new Error('Sql error');
        }
        if (param.where.id) {
            if (options.isUpdateDeleteMode) {
                resellerToUpdateDelete = ResellerList.find((reseller) => reseller.id == param.where.id);
                if (!resellerToUpdateDelete) {
                    return null;
                }
                return ResellerModel;
            }
            return ResellerList.find((reseller) => reseller.id === param.where.id);
        }
        return ResellerList[0];
    },
    findAll: () => {
        if (options.findAllError) {
            throw new Error('Sql error');
        }
        return ResellerList;
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
        ResellerList.push(data);
    },
    update: (updateData) => {
        if (options.updateError) {
            throw new Error('DB exception on update');
        }
        const updatedReseller = { ...resellerToUpdateDelete, ...updateData };
        const index = ResellerList.indexOf(resellerToUpdateDelete);
        ResellerList[index] = updatedReseller;
    }
};

module.exports = {
    ResellerList,
    setResellerOptions,
    resetResellerOptions,
    ResellerModel
};
