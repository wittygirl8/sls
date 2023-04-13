var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
const { TaxonomyService } = require('../business-logic/taxonomy.service');

export const getBusinessTypes = async () => {
    try {
        return response(await new TaxonomyService().findAllBusinessTypes());
    } catch (error) {
        console.error(error);
        return response({}, 500);
    }
};
