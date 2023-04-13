var { response, middy, models, userTypesValidatorMiddleware, getUserId } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');
const { DocumentService } = require('../../business-logic/document.service');

const documentService = new DocumentService();
const { UserType } = models;

export const updateDocumentTypeHandler = middy(async (event) => {
    try {
        const body = JSON.parse(event.body);
        const documentId = event.pathParameters.documentId;
        const userId = await getUserId(event);
        await documentService.updateDocumentType(documentId, body, event, userId);

        return response({});
    } catch (err) {
        console.log(err);
        return response({}, 500);
    }
}).use(userTypesValidatorMiddleware([UserType.ADMIN]));
