var {
    UserRepo,
    RelationshipRepo,
    MerchantRepo,
    ProductRequiredRepo,
    PaymentsConfigurationRepo,
    ResellerRepo
} = require('../../../libs/repo');

var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
var {
    sendEmail,
    zendeskProductsUpdateTemplate,
    constants,
    productsUpdatedTemplate,
    removeProductEmailTemplate,
    zohoDeskRemoveProductEmailTemplate
} = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
const { ProductStatus } = require('../helpers/ProductStatus');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);
const userRepo = new UserRepo(db);
const merchantRepo = new MerchantRepo(db);
const relationshipRepo = new RelationshipRepo(db);
const productsrepo = new ProductRequiredRepo(db);
const resellerRepo = new ResellerRepo(db);
const paymentsConfigurationRepo = new PaymentsConfigurationRepo(db);

export class EmailNotifyUpdatedProducts {
    async send(merchantId, updatedProduct, resellerId) {
        const reseller = await resellerRepo.findOne({ where: { id: resellerId } });
        const relationship = await relationshipRepo.findOne({ where: { merchantId: merchantId } });
        const user = await userRepo.findByPk(relationship.userId);
        const merchant = await merchantRepo.findOne({ where: { id: merchantId } });
        const paymentsConfiguration = await paymentsConfigurationRepo.findOne({ where: { merchantId: merchantId } });
        //const requiredProducts = await Promise.all(addedProduct.map(getProductsRequired));
        //const products = [].concat.apply([], requiredProducts);
        let productName = '';
        const acquirer = paymentsConfiguration ? paymentsConfiguration.acquirerBank : '';

        const resellerBrandingObj = {
            resellerLogo: reseller.logo,
            resellerContactUsPage: reseller.contactUsPageURL,
            portalURL: reseller.portalURL,
            resellerName: reseller.name,
            email: reseller.suportEmail,
            termAndCondPageUrl: reseller.termAndCondPageUrl,
            supportTelNo: reseller.supportTelNo,
            brandingURL: reseller.brandingURL,
            senderEmail: reseller.senderEmail,
            website: reseller.website,
            address: reseller.address
        };

        productName = updatedProduct[0].name;
        let zohoDeskProdUpdate;
        let productRequest;
        let emailSubjectClient = '';
        let emailSubjectAdmin = '';
        if (updatedProduct[0].status === ProductStatus.ADDITION_PENDING) {
            emailSubjectClient = `Request to add  ${productName} by ${merchant.name}`;
            emailSubjectAdmin = `Request to add  ${productName} by ${merchant.name}`;
            zohoDeskProdUpdate = zendeskProductsUpdateTemplate(productName, merchant.name, resellerBrandingObj);
            productRequest = productsUpdatedTemplate(productName, resellerBrandingObj);
        } else if (updatedProduct[0].status === ProductStatus.DELETION_PENDING) {
            emailSubjectClient = `Request to remove product ${productName} by ${merchant.name}`;
            emailSubjectAdmin = `Requested to remove product ${productName} by ${merchant.name}`;
            zohoDeskProdUpdate = zohoDeskRemoveProductEmailTemplate(
                productName,
                acquirer,
                merchant.name,
                resellerBrandingObj
            );
            productRequest = removeProductEmailTemplate(productName, resellerBrandingObj);
        }

        await sendEmail({
            email: user.email,
            subject: emailSubjectClient,
            message: productRequest,
            resellerBrandingObj
        });

        await sendEmail({
            email: constants.OMNIPAY_ADMIN_TEAM_EMAIL,
            subject: emailSubjectAdmin,
            message: zohoDeskProdUpdate,
            resellerBrandingObj
        });
    }
}

// eslint-disable-next-line
async function getProductsRequired(productId) {
    let productRecord = [];

    let productRequiredId = await productsrepo.findOne({
        where: { id: productId },
        attributes: ['name']
    });

    productRecord.push(productRequiredId);

    return productRecord;
}
