const WithdrawalsList = [];

const WithdrawalsModel = {
    create: (data) => {
        WithdrawalsList.push(data);
        return data;
    }
};

module.exports = {
    WithdrawalsList,
    WithdrawalsModel
};
