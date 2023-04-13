const transaction = {
    rollback: () => {},
    commit: () => {}
};

module.exports.sequelize = {
    transaction: () => Promise.resolve(transaction),
    cast: () => {},
    col: () => {},
    or: () => {}
};
