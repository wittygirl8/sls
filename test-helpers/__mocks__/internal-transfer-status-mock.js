const InternalTransferStatusList = [
    {
        id: '6689812938011705341',
        name: 'Pending',
        createdAt: '2020-06-29 12:26:58.0',
        updatedAt: '2020-06-29 12:26:58.0'
    },
    {
        id: '6689812938011705342',
        name: 'Sent',
        createdAt: '2020-06-29 12:26:58.0',
        updatedAt: '2020-06-29 12:26:58.0'
    },
    {
        id: '6689812938011705343',
        name: 'Not Received',
        createdAt: '2020-06-29 12:26:58.0',
        updatedAt: '2020-06-29 12:26:58.0'
    },
    {
        id: '6689812938011705344',
        name: 'Cancelled',
        createdAt: '2020-06-29 12:26:58.0',
        updatedAt: '2020-06-29 12:26:58.0'
    }
];

const InternalTransferStatusModel = {
    findOne: (query) => {
        return InternalTransferStatusList.find((internalTransferStatus) => internalTransferStatus.name === query.where.name);
    }
};

module.exports = {
    InternalTransferStatusList,
    InternalTransferStatusModel
};
