var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
const { TaxonomyService } = require('../business-logic/taxonomy.service');

export const getMotoRenewalReason = async () => {
    try {
        const motoReasonList = await new TaxonomyService().findAllMotoRenewalreason();
        return response(motoReasonList);
    } catch (error) {
        console.error(error);
        return response({}, 500);
    }
};
