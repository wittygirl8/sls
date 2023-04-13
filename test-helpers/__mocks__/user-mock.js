const UserList = [
    {
        id: '6Qc2rZbKcXOZqGRElqIvt',
        firstName: 'Aswe',
        lastName: 'Hold',
        email: 'aswe@gmail.com',
        pictureUrl: null,
        isDisable: 0,
        isDeleted: null,
        createdAt: '2020-06-29 12:26:58.0',
        updatedAt: '2020-06-29 12:26:58.0',
        createdBy: null,
        typeId: null,
        refreshToken: 'New Refresh token'
    },
    {
        id: 'aJatoBvMJuFOh_o1mcFG6',
        firstName: 'Nava',
        lastName: 'Illap',
        email: 'nava@gmail.com',
        pictureUrl: null,
        isDisable: 0,
        isDeleted: null,
        createdAt: '2020-07-01 12:38:23.0',
        updatedAt: '2020-07-01 12:38:23.0',
        createdBy: null,
        typeId: null,
        refreshToken: null
    }
];

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
const setUserOptions = (opt) => {
    options = opt;
};

const resetUserOptions = () => {
    options.saveError = false;
    options.isUpdateDeleteMode = false;
    options.findAllError = false;
    options.findByPkError = false;
    options.destroyError = false;
    options.updateError = false;
    options.findOneEntityExists = false;
};

const UserModel = {
    findAll: (query) => {
        if (Array.isArray(query.where.id)) {
            return UserList.filter((user) => query.where.id.includes(user.id));
        }

        return UserList.find((user) => user.id == query.where.id);
    },
    findOne: (query) => {
        if (query.where.email) {
            return UserList.find((user) => user.email === query.where.email);
        }

        if (query.where.id) {
            if (options.isUpdateDeleteMode) {
                const userToSave = UserList.find((user) => user.id == query.where.id);
                if (!userToSave) {
                    return null;
                }
                return UserModel;
            } else {
                return UserList.find((user) => user.id == query.where.id);
            }
        }
    },
    count: (query) => {
        if (query.where.email) {
            return UserList.filter((user) => user.email === query.where.email).length;
        }
    },
    create: (data) => {
        if (options.saveError) {
            throw new Error('DB exception on save');
        }
        UserList.push(data);
        return data;
    },
    update: (data) => {
        const indexOfUpdateUser = UserList.findIndex((user) => user.id == data.id);
        UserList[indexOfUpdateUser] = data;
    },

    findByPk: (id) => {
        return UserList.find((user) => user.id == id);
    }
};

module.exports = {
    UserList,
    UserModel,
    setUserOptions,
    resetUserOptions
};
