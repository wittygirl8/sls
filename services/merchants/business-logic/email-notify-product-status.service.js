var { UserRepo, RelationshipRepo, MerchantRepo, ProductRequiredRepo, ResellerRepo } = require('../../../libs/repo');

var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
var { sendEmail, addedProductTemplate, rejectProductTemplate, removedProductTemplate } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
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

export class EmailNotifyProductStatus {
    async sendProduct(merchantId, productId, resellerId, status, reason, prevStatus) {
        const reseller = await resellerRepo.findOne({ where: { id: resellerId } });
        const relationship = await relationshipRepo.findOne({ where: { merchantId: merchantId } });
        const user = await userRepo.findByPk(relationship.userId);
        const merchant = await merchantRepo.findOne({ where: { id: merchantId } });

        const productRecord = await productsrepo.findOne({
            where: { id: productId },
            attributes: ['name']
        });
        let productName = '';
        productName = productRecord.name;
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

        const rejectedProduct = rejectProductTemplate(productName, reason, resellerBrandingObj, prevStatus);
        const AddedProduct = addedProductTemplate(productName, productId, resellerBrandingObj);
        const removedProduct = removedProductTemplate(productName, resellerBrandingObj);
        if (status === ProductStatus.ACTIVE && prevStatus === ProductStatus.DELETION_PENDING) {
            await sendEmail({
                email: user.email,
                subject: `Request rejected to remove ${productName} by ${merchant.name}`,
                message: rejectedProduct,
                resellerBrandingObj
            });
        }
        if (status === ProductStatus.ACTIVE && prevStatus === ProductStatus.ADDITION_PENDING) {
            await sendEmail({
                email: user.email,
                subject: `Request approved to add ${productName} by ${merchant.name}`,
                message: AddedProduct,
                resellerBrandingObj
            });
        }

        if (status === ProductStatus.REJECTED) {
            await sendEmail({
                email: user.email,
                subject: `Request rejected to add ${productName} by ${merchant.name}`,
                message: rejectedProduct,
                resellerBrandingObj
            });
        }
        if (status === ProductStatus.INACTIVE) {
            await sendEmail({
                email: user.email,
                subject: `Request approved to remove ${productName}`,
                message: removedProduct,
                resellerBrandingObj
            });
        }
    }
}
