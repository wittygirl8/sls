require('dotenv').config();

var { response, getUserId } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');
const { TermsAndConditionsService } = require('../../business-logic/terms-and-conditions.service');
const {
    EmailNotifyAcceptTermsAndConditoinsService
} = require('../../business-logic/email-notify-accept-terms-and-conditions.service');

const termsAndConditionsService = new TermsAndConditionsService();
const emailNotifyAcceptTermsAndConditoinsService = new EmailNotifyAcceptTermsAndConditoinsService();
const { entityName } = require('../../helpers/TermsAndConditionsNameToColumn');

export const acceptTermsAndConditions = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const entityId = event.pathParameters.entityId;
        const entity = event.pathParameters.entity;
        const userId = await getUserId(event);
        const sourceIP = event.requestContext.identity.sourceIp;
        const userAgentInfo = event.requestContext.identity.userAgent;
        const selectedDocumentIds = body.selectedDocumentIds;

        const termsAndConditionDto = await termsAndConditionsService.acceptTermsAndConditions(
            entityId,
            entity,
            selectedDocumentIds,
            sourceIP,
            userId,
            userAgentInfo,
            event
        );

        if (entity === entityName.CANONICAL_RESELLER) {
            await emailNotifyAcceptTermsAndConditoinsService.send(userId, entityId, termsAndConditionDto.tcDocIds);
        }

        const responseData = {
            signedOn: termsAndConditionDto.signedOn
        };

        return response(responseData);
    } catch (err) {
        console.error(err);
        return response({}, 500);
    }
};
