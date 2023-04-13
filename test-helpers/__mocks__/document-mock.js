const DocumentList = [
    {
        id: '98797979',
        merchantId: '24535354353',
        filename: 'hello.png',
        size: '789769'
    },
    {
        id: '1231241312',
        merchantId: '89080870',
        filename: 'pronto.jpg',
        size: '789769'
    },
    {
        id: '547657567',
        merchantId: '678678678',
        filename: 'alo.pdf',
        size: '789769'
    }
];

/**
 * @type {{
 * isUpdateDeleteMode: boolean
 * findAllError: boolean
 * findByPkError: boolean
 * destroyError: boolean
 * saveError: boolean
 * updateError: boolean
 * }} options
 */
let options = {};

/**
 *
 * @param {{
 * isUpdateDeleteMode: boolean
 * findAllError: boolean
 * findByPkError: boolean
 * destroyError: boolean
 * saveError: boolean
 * updateError: boolean
 * }} opt
 */
const setDocumentOptions = (opt) => {
    options = opt;
};

const resetDocumentOptions = () => {
    options.saveError = false;
    options.isUpdateDeleteMode = false;
    options.findAllError = false;
    options.findByPkError = false;
    options.destroyError = false;
    options.updateError = false;
    options.findOneEntityExists = false;
};

let documentToUpdateDelete;

const DocumentModel = {
    findByPk: (id) => {
        if (typeof id !== 'string') {
            throw new Error('Sql error');
        }

        if (options.findByPkError) {
            throw new Error('DB error on findByPk');
        }

        if (options.isUpdateDeleteMode) {
            documentToUpdateDelete = DocumentList.find((document) => document.id == id);
            if (!documentToUpdateDelete) {
                return null;
            }
            return DocumentModel;
        }
        return DocumentList.find((document) => document.id === id);
    },
    findOne: (param) => {
        if (options.findOneEntityExists) {
            return DocumentList[0];
        }
        if (param.where.id) {
            if (options.isUpdateDeleteMode) {
                documentToUpdateDelete = DocumentList.find((document) => document.id === param.where.id);
                if (!documentToUpdateDelete) {
                    return null;
                }
                return DocumentModel;
            }
            return DocumentList.find((document) => document.id === param.where.id);
        }
        return null;
    },
    findAll: () => {
        if (options.findAllError) {
            throw new Error('Sql error');
        }
        return DocumentList;
    },
    count: () => {
        if (options.findOneEntityExists) {
            return 1;
        }
        return 0;
    },
    create: (data) => {
        if (options.saveError) {
            throw new Error('DB exception on save');
        }
        DocumentList.push(data);
    },
    update: (updateData) => {
        if (options.updateError) {
            throw new Error('DB exception on update');
        }

        const updatedDocument = assignDefined(documentToUpdateDelete, updateData);
        const index = DocumentList.indexOf(documentToUpdateDelete);
        DocumentList[index] = updatedDocument;
    },
    destroy: () => {
        if (options.destroyError) {
            throw new Error('Sql error');
        }
        const index = DocumentList.indexOf(documentToUpdateDelete);
        DocumentList.splice(index, 1);
    }
};

function assignDefined(target, source) {
    Object.keys(source).map((key) => {
        if (source[key] !== undefined) {
            target[key] = source[key];
        }
    });

    return target;
}

module.exports = {
    DocumentList,
    setDocumentOptions,
    resetDocumentOptions,
    DocumentModel
};
