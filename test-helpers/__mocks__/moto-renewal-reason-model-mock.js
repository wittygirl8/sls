const MotoRenewalReasonList = [
    {
        id: 1,
        name: 'Renewal Reason 1',
        created_at: '2020-08-07 08:38:50.0',
        updated_at: '2020-08-07 08:38:50.0'
    },
    {
        id: 2,
        name: 'Renewal Reason 2',
        created_at: '2020-08-07 08:38:50.0',
        updated_at: '2020-08-07 08:38:50.0'
    },
    {
        id: 3,
        name: 'Renewal Reason 3',
        created_at: '2020-08-07 08:38:50.0',
        updated_at: '2020-08-07 08:38:50.0'
    }
];

const MotoRenewalReasonModel = {
    findAll: () => {
        return MotoRenewalReasonList;
    }
};

module.exports = {
    MotoRenewalReasonList,
    MotoRenewalReasonModel
};
