const deleteUserFunction = require('../libs/delete-user');

export const deleteUser = async (event) => {
    const deleteUserResponse = deleteUserFunction.deleteUser(event);
    return deleteUserResponse;
};
