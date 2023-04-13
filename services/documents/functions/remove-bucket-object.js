var { response, userAccessValidatorMiddleware, middy } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
const { DocumentService } = require('../business-logic/document.service');
const { DocumentEntity } = require('../utils/document-entity');

export const main = middy(async (event) => {
    try {
        const entity = event.pathParameters.entity;
        const entityId = event.pathParameters.entityId;
        const documentId = event.pathParameters.documentId;
        if (!DocumentEntity.includes(entity)) {
            return response('Entity not defined', 400);
        }
        await new DocumentService().removeBucketDocument(entity, entityId, documentId, JSON.parse(event.body));
        return response({}, 204);
    } catch (error) {
        return response({}, 500);
    }
}).use(userAccessValidatorMiddleware('entityId'));
