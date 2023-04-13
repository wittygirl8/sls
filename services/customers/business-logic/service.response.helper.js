/**
 * @description Wrap data in object with succes operation status
 * @returns {{operationStatus: true, data: any}}
 */
function SuccessOperation(data) {
    return {
        operationStatus: true,
        data: data
    };
}

/**
 * @description Wrap data in object with failed operation status
 * @returns {{operationStatus: true, data: any}}
 */
function FailedOperation(data) {
    return {
        operationStatus: false,
        data: data
    };
}

export { SuccessOperation, FailedOperation };
