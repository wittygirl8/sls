var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
const { TaxonomyService } = require('../business-logic/taxonomy.service');

export const getDescriptions = async () => {
    try {
        const businessDescriptions = await new TaxonomyService().findAllBusinessDescriptions();

        return response(
            {
                businessDescriptions: businessDescriptions
            },
            200
        );
    } catch (error) {
        console.error(error);
        return response({}, 500);
    }
};
