var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');

var { TaxonomyService } = require('../business-logic/taxonomy.service');

const taxonomyService = new TaxonomyService();

export const handler = async () => {
    try {
        const docTypes = await taxonomyService.findAllDocumentTypes();
        const docTypesDto = docTypes.map((docType) => {
            return {
                id: docType.id,
                name: docType.name
            };
        });
        return response(docTypesDto);
    } catch (err) {
        console.error(err);
        return response({}, 500);
    }
};
