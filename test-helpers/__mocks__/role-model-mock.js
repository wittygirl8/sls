const RolesList = [
    {
        id: '7jv4kW_x2ktIT-kdh-Jx8',
        name: 'Manager',
        createdAt: '2020-06-26 16:15:46.0',
        updatedAt: '2020-06-26 16:15:46.0',
    },
    {
        id: 'i1pCUrKvSPTJ3zP6sX_wx',
        name: 'Admin',
        createdAt: '2020-06-26 16:15:40.0',
        updatedAt: '2020-06-26 16:15:40.0',
    },
    {
        id: '_TJUbUYJP4FKAFipCIK4_',
        name: 'User',
        createdAt: '2020-06-26 16:15:40.0',
        updatedAt: '2020-06-26 16:15:40.0',
    },
    {
        id: 'frJUbUlogbyKAFipiiuyb',
        name: 'Owner',
        createdAt: '2020-06-26 16:15:40.0',
        updatedAt: '2020-06-26 16:15:40.0',
    },
];

/**
 * @type {{
 * notFoundError: boolean,
 * getOwnerRole: boolean
 * }} options
 */
let options = {};

/**
 *
 * @param {{
 * notFoundError: boolean,
 * getOwnerRole: boolean
 * }} opt
 */
function setRoleOptions(opt) {
    options = opt;
}

const resetRoleOptions = () => {
    options.notFoundError = false;
};

module.exports = {
    RolesList,
    setRoleOptions,
    resetRoleOptions,
    RoleModel: {
        findOne: () => {
            if (options.notFoundError) {
                throw new Error('Role not found');
            }
            if (options.getOwnerRole) {
                return RolesList.find((role) => (role.name === 'Owner'));
            }
            return RolesList.find((role) => (role.name === 'Admin'));
        },
    },
};
