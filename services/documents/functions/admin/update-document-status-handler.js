var { response, middy, models, userTypesValidatorMiddleware, getUserId } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');
const { DocumentService } = require('../../business-logic/document.service');
const { UserType } = models;

const documentService = new DocumentService();
export const updateDocumentStatusHandler = middy(async (event) => {
    try {
        const body = JSON.parse(event.body);
        const documentId = event.pathParameters.documentId;
        const merchantId = event.pathParameters.merchantId;
        const userId = await getUserId(event);
        await documentService.updateDocumentStatus(merchantId, documentId, body, event, userId);

        return response({});
    } catch (err) {
        console.log(err);
        return response({}, 500);
    }
}).use(userTypesValidatorMiddleware([UserType.ADMIN]));
