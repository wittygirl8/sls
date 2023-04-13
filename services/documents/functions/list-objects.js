var { response, userAccessValidatorMiddleware, middy } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
const { DocumentService } = require('../business-logic/document.service');
const { DocumentEntity } = require('../utils/document-entity');

//For Test purposes

export const main = middy(async (event) => {
    const entity = event.pathParameters.entity;
    const entityId = event.pathParameters.entityId;
    const flag = event.pathParameters.flag !== 'undefined' ? event.pathParameters.flag : null;

    if (!DocumentEntity.includes(entity)) {
        return response('Entity not defined', 400);
    }

    try {
        return response(await new DocumentService().findAll(entity, entityId, flag));
    } catch (error) {
        console.error(error);
        return response({}, 500);
    }
}).use(userAccessValidatorMiddleware('entityId'));
