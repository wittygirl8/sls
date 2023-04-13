const UserTypes = [
    {
        id: 1,
        name: 'Owner',
        createdAt: '2020-06-29 12:26:58.0',
        updatedAt: '2020-06-29 12:26:58.0'
    },
    {
        id: 2,
        name: 'Admin',
        createdAt: '2020-07-01 12:38:23.0',
        updatedAt: '2020-07-01 12:38:23.0'
    }
];

let options = {};

/**
 *
 * @param {{
 * findAllError: boolean
 * findOneError: boolean
 * }} opt
 */
const setUserTypeOptions = (opt) => {
    options = opt;
};

const resetUserTypeOptions = () => {
    options.findAllError = false;
    options.findOneError = false;
};

const UserTypeModel = {
    findAll: () => {
        if (options.findAllError) {
            throw new Error('Sql error');
        }
        return UserTypes;
    },
    findOne: () => {
        if (options.findAllError) {
            throw new Error('Sql error');
        }
        return UserTypes[0];
    }
};

module.exports = {
    UserTypes,
    UserTypeModel,
    setUserTypeOptions,
    resetUserTypeOptions
};
