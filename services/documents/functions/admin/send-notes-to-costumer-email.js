var { response, middy, models, userTypesValidatorMiddleware } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');
const { DocumentService } = require('../../business-logic/document.service');
const { UserType } = models;

export const main = middy(async (event) => {
    const body = JSON.parse(event.body);
    const merchantId = body.merchantId;
    const resellerId = body.resellerId;
    const notes = body.notes;
    try {
        await new DocumentService().sendEmailToCostumer(merchantId, resellerId, notes);
        return response({});
    } catch (error) {
        console.error(error);
        return response({ error: 'An Error occurred while sending the email' }, 500);
    }
}).use(userTypesValidatorMiddleware([UserType.ADMIN]));
