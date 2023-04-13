var { response, userAccessValidatorMiddleware, middy } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
const { DocumentService } = require('../business-logic/document.service');
const { DocumentEntity } = require('../utils/document-entity');

export const main = middy(async (event) => {
    const entity = event.pathParameters.entity;
    const entityId = event.pathParameters.entityId;

    if (!DocumentEntity.includes(entity)) {
        return response('Entity not defined', 400);
    }

    try {
        return response(await new DocumentService().preSignedUrlPut(entity, entityId, JSON.parse(event.body)));
    } catch (error) {
        console.error(error);
        return response({}, 500);
    }
}).use(userAccessValidatorMiddleware('entityId'));
