var { response } = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');
const { TermsAndConditionsService } = require('../../business-logic/terms-and-conditions.service');

const termsAndConditionsService = new TermsAndConditionsService();
const { TermsAndConditionsEntity } = require('../../utils/terms-and-conditions-entity');

export const putPreSignedUrl = async (event) => {
    const entity = event.pathParameters.entity;
    const entityId = event.pathParameters.entityId;

    if (!TermsAndConditionsEntity.includes(entity)) {
        return response('Entity not defined', 400);
    }

    try {
        return response(await termsAndConditionsService.preSignedUrlPut(entity, entityId, JSON.parse(event.body)));
    } catch (error) {
        console.error(error);
        return response({}, 500);
    }
};
