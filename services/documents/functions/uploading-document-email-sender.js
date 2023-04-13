var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
const { DocumentService } = require('../business-logic/document.service');

export const main = async (event) => {
    const body = JSON.parse(event.body);
    const merchantId = body.merchantId;
    const resellerId = body.resellerId;
    const isBankDetailsUpdated = body.isBankDetailsUpdated;
    try {
        await new DocumentService().notifyAdminAboutDocumentUploading(merchantId, resellerId, isBankDetailsUpdated);
        return response({});
    } catch (error) {
        console.error(error);
        return response({}, 500);
    }
};
