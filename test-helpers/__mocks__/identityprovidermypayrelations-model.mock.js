const IdentityProviderMyPayRelationsList = [
    {
        id: '2Gxb_Y4p-ebuNubYTKV-7',
        userId: '6Qc2rZbKcXOZqGRElqIvt',
        providerId: '2700e0e8-9670-4023-935e-cbe394877138',
        providerName: 'AWS Cognito',
        isActive: null,
        createdAt: '2020-07-08 13:57:05.0',
        updatedAt: '2020-07-08 13:57:05.0'
    },
    {
        id: '6JEkmaMDx28NpMmmPY6Tl',
        userId: 'wjm-_gQtROp0_s7_obesV',
        providerId: '7c4fa970-056e-49d7-bd1e-215698703a23',
        providerName: 'AWS Cognito',
        isActive: null,
        createdAt: '2020-07-09 08:48:25.0',
        updatedAt: '2020-07-09 08:48:25.0'
    },
    {
        id: '9V62B9rOQq0JPbkMUhkhO',
        userId: 'aJatoBvMJuFOh_o1mcFG6',
        providerId: '0b159073-ef25-4f30-afe5-ea994796dceb',
        providerName: 'AWS Cognito',
        isActive: null,
        createdAt: '2020-07-01 12:38:23.0',
        updatedAt: '2020-07-01 12:38:23.0'
    }
];

const IdentityProviderMyPayRelationsModel = {
    findOne: (query) => {
        if (query.where.email) {
            return IdentityProviderMyPayRelationsList.find((user) => user.email === query.where.email);
        }
    },
    count: (query) => {
        if (query.where.email) {
            return IdentityProviderMyPayRelationsList.filter((user) => user.email === query.where.email).length;
        }
    },
    create: (data) => {
        IdentityProviderMyPayRelationsList.push(data);
    }
};

module.exports = {
    IdentityProviderMyPayRelationsList,
    IdentityProviderMyPayRelationsModel
};
