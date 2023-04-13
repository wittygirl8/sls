const InternalTransfersList = [];

const InternalTransfersModel = {
    create: (data) => {
        InternalTransfersList.push(data);
        return data;
    }
};

module.exports = {
    InternalTransfersList,
    InternalTransfersModel
};
