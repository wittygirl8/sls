var { response, userAccessValidatorMiddleware, middy, getUserId } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
const { DocumentService } = require('../business-logic/document.service');
const { DocumentEntity } = require('../utils/document-entity');

export const main = middy(async (event) => {
    const entity = event.pathParameters.entity;
    const entityId = event.pathParameters.entityId;
    const documentId = event.pathParameters.documentId;
    const userId = await getUserId(event);
    if (!DocumentEntity.includes(entity)) {
        return response('Entity not defined', 400);
    }

    console.log('Document service');
    try {
        await new DocumentService().saveObject(entity, entityId, documentId, JSON.parse(event.body), event, userId);
        return response({});
    } catch (error) {
        console.error(error);
        return response({}, 500);
    }
}).use(userAccessValidatorMiddleware('entityId'));
