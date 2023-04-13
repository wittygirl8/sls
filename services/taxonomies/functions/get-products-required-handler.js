var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
const { TaxonomyService } = require('../business-logic/taxonomy.service');

export const getProductsRequired = async () => {
    try {
        const productsRequired = await new TaxonomyService().findAllProductRequired();

        return response(productsRequired, 200);
    } catch (error) {
        console.error(error);
        return response({}, 500);
    }
};
