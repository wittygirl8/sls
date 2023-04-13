const RelationshipsList = [
    {
        id: 'WwwuYAbZa6vN8smhNM-I8',
        userId: '0ZpjHWPQzmWzduC7EssWI',
        businessId: '-nYNgl4zquGghT3DXdWJs',
        clientId: null,
        merchantId: 12345,
        roleId: 'i1pCUrKvSPTJ3zP6sX_wx',
        createdAt: '2020-07-03 11:56:20.0',
        updatedAt: '2020-07-03 11:56:20.0',
        deletedAt: null
    },
    {
        id: 'H5DE5lyUs6Neh8QOtTW8Q',
        userId: 'aJatoBvMJuFOh_o1mcFG6',
        businessId: '0Vn49hNM6BumthlsbPQ26',
        clientId: null,
        merchantId: null,
        roleId: 'i1pCUrKvSPTJ3zP6sX_wx',
        createdAt: '2020-07-04 13:53:45.0',
        updatedAt: '2020-07-04 15:32:34.0',
        deletedAt: '2020-07-04 15:32:34.0'
    },
    {
        id: '77YeRdSrqivtJMhhnL_oT',
        userId: '6B9IYNrN1d9Iy5sLhuicY',
        businessId: 'rJJu0JuLuxCgU7pWm7na6',
        clientId: null,
        merchantId: 12346,
        roleId: 'i1pCUrKvSPTJ3zP6sX_wx',
        createdAt: '2020-07-03 08:52:13.0',
        updatedAt: '2020-07-03 08:52:13.0',
        deletedAt: null
    },
    {
        id: 'ynhuk55a4s4aas_as_iik',
        userId: '0ZpjHWPQzmWzduC7EssWI',
        businessId: 'rJJu0JuLuxCgU7pWm7na6',
        clientId: null,
        merchantId: null,
        roleId: 'frJUbUlogbyKAFipiiuyb',
        createdAt: '2020-07-03 08:52:13.0',
        updatedAt: '2020-07-03 08:52:13.0',
        deletedAt: null
    }
];

let relationToUpdateDelete = {};
/**
 * @type {{
 *   findOneIsExist: boolean,
 *   findOneWithRelationValid: boolean,
 *   findOneWithOwnerRole: boolean,
 *   userHasBusiness: boolean,
 *   errorOnSave: boolean
 * }}
 */
let options = {};

/**
 * @param {{
 *   findOneIsExist: boolean,
 *   findOneWithRelationValid: boolean,
 *   findOneWithOwnerRole: boolean,
 *   userHasBusiness: boolean,
 *   errorOnSave: boolean
 * }} opt
 */
function setRelationshipOptions(opt) {
    options = opt;
}

function resetRelationshipOptions() {
    options = {};
}

const RelationshipModel = {
    findOne: (data) => {
        if (options.findOneIsExist) {
            return RelationshipsList[0];
        }

        if (options.findOneWithRelationValid) {
            return RelationshipsList[1];
        }

        if (options.findOneWithOwnerRole) {
            return RelationshipsList[3];
        }

        const keys = Object.keys(data.where);

        if (options.isUpdateDeleteMode) {
            relationToUpdateDelete = relationship;
        }
        const relationship = RelationshipsList.find((relation) => {
            keys.every((key) => relation[key] === data.where[key]);
        });

        if (options.isUpdateDeleteMode) {
            relationToUpdateDelete = relationship;
            return RelationshipModel;
        }

        return relationship;
    },
    findByPk: (id) => {
        const relationship = RelationshipsList.find((relation) => relation.id === id);

        if (options.isUpdateDeleteMode) {
            relationToUpdateDelete = relationship;
            return RelationshipModel;
        }
        return relationship;
    },
    create: (data) => {
        if (options.errorOnSave) {
            throw new Error('Sql error');
        }
        RelationshipsList.push(data);
    },
    count: () => {
        return options.userHasBusiness ? 1 : 0;
    },
    destroy: () => {
        if (options.destroyError) {
            throw new Error('Sql error');
        }
        const index = RelationshipsList.indexOf(relationToUpdateDelete);
        RelationshipsList.splice(index, 1);
    },
    findAll: (param) => {
        if (options.findAllError) {
            throw new Error('Sql error');
        }
        if (param.where.merchantId)
            return RelationshipsList.filter((relation) => param.where.merchantId.includes(relation.merchantId));
        if (param.where.userId)
            return RelationshipsList.filter((relation) => param.where.userId.includes(relation.userId));
    }
};

module.exports = {
    RelationshipsList,
    RelationshipModel,
    setRelationshipOptions,
    resetRelationshipOptions
};
