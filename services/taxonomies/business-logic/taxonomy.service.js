var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const {
    DocumentTypeRepo,
    BusinessTypeRepo,
    MotoRenewalReasonRepo,
    ProductDescriptionRepo,
    ProductRequiredRepo,
    BusinessDescriptionRepo
} = require('../../../libs/repo');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

const documentTypeRepo = new DocumentTypeRepo(db);
const businessTypeRepoInstance = new BusinessTypeRepo(db);
const motoRenewalReasonRepo = new MotoRenewalReasonRepo(db);
const productDescriptionRepo = new ProductDescriptionRepo(db);
const productRequiredRepo = new ProductRequiredRepo(db);
const businessDescriptionRepo = new BusinessDescriptionRepo(db);

export class TaxonomyService {
    async findAllDocumentTypes() {
        return await documentTypeRepo.findAll();
    }

    async findAllBusinessTypes() {
        return await businessTypeRepoInstance.findAll();
    }

    async findAllMotoRenewalreason() {
        return await motoRenewalReasonRepo.findAll();
    }

    async findAllProductDescriptions() {
        return await productDescriptionRepo.findAll();
    }

    async findAllProductRequired() {
        return await productRequiredRepo.findAll();
    }

    async findAllBusinessDescriptions() {
        return await businessDescriptionRepo.findAll();
    }
}
