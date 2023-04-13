import { TermsAndConditionStatus } from '../../documents/utils/terms-and-conditions-status';
import { ProductsRequiredNamesToId } from '../helpers/product-name-to-id';

var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
var { models, sendEmail, merchantAccountUnverifiedEmailTemplate } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');

const {
    MerchantRepo,
    UserRoleRepo,
    ResellerRepo,
    RelationshipRepo,
    UserRepo,
    TermsAndConditionsMapRepo,
    TermsAndConditionsRepo,
    AcquirerAccountConfigurationRepo,
    AcquirersRepo
} = require('../../../libs/repo');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);
const { Op } = db.Sequelize;
const merchantRepo = new MerchantRepo(db);
const userRoleRepo = new UserRoleRepo(db);
const resellerRepo = new ResellerRepo(db);
const relationshipRepo = new RelationshipRepo(db);
const userRepo = new UserRepo(db);
const termsAndConditionsMapRepo = new TermsAndConditionsMapRepo(db);
const termsAndConditionsRepo = new TermsAndConditionsRepo(db);
const acquirerAccountConfigurationRepo = new AcquirerAccountConfigurationRepo(db);
const acquirerRepo = new AcquirersRepo(db);

export class MerchantService {
    async getById(id) {
        return await merchantRepo.findOne({
            where: {
                id: id
            }
        });
    }

    async getMerchantAcquirer(id) {
        return await acquirerAccountConfigurationRepo.findOne({
            where: {
                merchantId: id
            }
        });
    }

    async getUserMerchants(userId, resellerId) {
        return await merchantRepo.findAll({
            where: {
                clientId: { [Op.eq]: null },
                name: { [Op.ne]: 'Test Merchant' }
            },
            include: [
                {
                    model: db.Relationship,
                    where: {
                        userId: userId,
                        resellerId: resellerId
                    },
                    include: [
                        {
                            model: db.Role,
                            attributes: ['id', 'name']
                        }
                    ]
                },
                {
                    model: db.MerchantProductRequired,
                    attributes: ['id', 'productRequiredId', 'status', 'additionalInfo'],
                    include: [
                        {
                            model: db.ProductRequired,
                            attributes: ['name']
                        }
                    ]
                },
                {
                    model: db.BusinessBankDetails,
                    attributes: ['status']
                },
                {
                    model: db.BusinessDetail,
                    attributes: ['businessTypeId', 'vatNumber']
                },
                {
                    model: db.AcquirerAccountConfiguration,
                    attributes: [
                        'adyenSubAccountId',
                        'dnaMid',
                        'payoutStatus',
                        'accountStatus',
                        'applicationId',
                        'acquirer'
                    ]
                },
                {
                    model: db.PaymentsConfiguration,
                    required: false,
                    attributes: ['acquirerBank']
                },
                {
                    model: db.OwnersDetails,
                    attributes: ['email', 'contactPhone']
                }
            ],
            order: [['name', 'ASC']]
        });
    }

    async getTermsAndConditionsForMerchant(merchantId, modalTermsAndConditions) {
        try {
            let docStatus = [TermsAndConditionStatus.ACTIVE, TermsAndConditionStatus.PENDING];
            if (modalTermsAndConditions === 'modalDisplay') {
                docStatus = [TermsAndConditionStatus.PENDING];
            }

            const termsAndConditions = await termsAndConditionsMapRepo.findAll({
                where: {
                    merchantId: merchantId,
                    status: { [Op.in]: docStatus }
                },
                include: [
                    {
                        model: db.TermsAndConditions,
                        attributes: ['link']
                    }
                ]
            });

            return termsAndConditions;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async countOfTermsAndConditionForMerchant(merchants) {
        try {
            const termsAndConditions = await termsAndConditionsMapRepo.findAll({
                where: {
                    merchantId: {
                        [Op.in]: merchants.map((merchant) => merchant.id)
                    }
                }
            });
            const acquirerInfo = await acquirerRepo.findOne({
                where: {
                    name: 'DNA'
                }
            });

            const acquirerTermsAndConditons = await termsAndConditionsRepo.findAll({
                where: {
                    id: {
                        [Op.in]: termsAndConditions.map((document) => document.tcId)
                    },
                    creator: 'acquirer',
                    acquirerId: acquirerInfo.id
                },
                attributes: ['id']
            });
            const acquirerDocumentIds = acquirerTermsAndConditons.map((document) => document.id);

            const merchantAndTAndCMap = {};

            for (let i = 0; i < termsAndConditions.length; i++) {
                let acquirerDocumentId = termsAndConditions[i].tcId;
                let isAcquirerDocument = acquirerDocumentIds.includes(acquirerDocumentId);
                if (merchantAndTAndCMap[termsAndConditions[i].merchantId]) {
                    let getObject = { ...merchantAndTAndCMap[termsAndConditions[i].merchantId] };
                    const countObject = {
                        noOfNotSignedTermsAndConditions:
                            termsAndConditions[i].status === TermsAndConditionStatus.PENDING
                                ? getObject.noOfNotSignedTermsAndConditions + 1
                                : getObject.noOfNotSignedTermsAndConditions,
                        noOfSignedTermsAndConditions:
                            termsAndConditions[i].status === TermsAndConditionStatus.ACTIVE
                                ? getObject.noOfSignedTermsAndConditions + 1
                                : getObject.noOfSignedTermsAndConditions,
                        signedTermsAndConditionsDate: termsAndConditions[i].activatedAt,
                        noOfNotSignedAcquirerTermsAndConditions:
                            isAcquirerDocument && termsAndConditions[i].status === TermsAndConditionStatus.PENDING
                                ? getObject.noOfNotSignedAcquirerTermsAndConditions + 1
                                : getObject.noOfNotSignedAcquirerTermsAndConditions
                    };
                    merchantAndTAndCMap[termsAndConditions[i].merchantId] = countObject;
                } else {
                    const countObject = {
                        noOfNotSignedTermsAndConditions:
                            termsAndConditions[i].status === TermsAndConditionStatus.PENDING ? 1 : 0,
                        noOfSignedTermsAndConditions:
                            termsAndConditions[i].status === TermsAndConditionStatus.ACTIVE ? 1 : 0,
                        noOfNotSignedAcquirerTermsAndConditions:
                            isAcquirerDocument && termsAndConditions[i].status === TermsAndConditionStatus.PENDING
                                ? 1
                                : 0,
                        signedTermsAndConditionsDate: termsAndConditions[i].activatedAt
                    };
                    merchantAndTAndCMap[termsAndConditions[i].merchantId] = countObject;
                }
            }

            return merchantAndTAndCMap;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getAdminMerchants(resellerId, searchedString, includeMerchantId) {
        try {
            const defaultMerchantId = Number(resellerId) === 2 ? 663176007 : 663191524;
            includeMerchantId = includeMerchantId ? includeMerchantId : -1;
            var whereMerchantNameOrPostCode;

            if (searchedString.length > 2) {
                searchedString = '%' + searchedString + '%';
                whereMerchantNameOrPostCode = {
                    [Op.or]: [
                        // {
                        //     '$Merchant.name$': {
                        //         [Op.like]: searchedString
                        //     }
                        // }
                        // {
                        //     postCode: {
                        //         [Op.like]: searchedString
                        //     }
                        // },
                        {
                            '$Merchant.id': {
                                [Op.like]: searchedString
                            }
                        }
                    ]
                };
            } else {
                whereMerchantNameOrPostCode = {};
            }
            const allMerchantsByQuery = await merchantRepo.findAll({
                where: {
                    clientId: { [Op.eq]: null },
                    id: defaultMerchantId
                },
                include: [
                    {
                        model: db.Relationship,
                        where: {
                            resellerId: resellerId
                        }
                    },
                    {
                        model: db.Address,
                        as: 'TradingAddress',
                        where: whereMerchantNameOrPostCode
                    },
                    {
                        model: db.MerchantProductRequired,
                        include: [
                            {
                                model: db.ProductRequired
                            }
                        ]
                    },
                    {
                        model: db.BusinessDetail,
                        attributes: ['businessTypeId', 'vatNumber']
                    },
                    {
                        model: db.AcquirerAccountConfiguration,
                        attributes: ['adyenSubAccountId', 'dnaMid', 'payoutStatus', 'accountStatus']
                    }
                ],
                limit: includeMerchantId === -1 ? 5 : 4,
                order: [['name', 'ASC']]
            });

            if (includeMerchantId !== -1) {
                const merchantToInclude = await merchantRepo.findOne({
                    where: { id: includeMerchantId },
                    include: [
                        {
                            model: db.Relationship,
                            where: {
                                resellerId: resellerId
                            }
                        },
                        {
                            model: db.MerchantProductRequired,
                            include: [
                                {
                                    model: db.ProductRequired
                                }
                            ]
                        },
                        {
                            model: db.BusinessDetail,
                            attributes: ['businessTypeId', 'vatNumber']
                        },
                        {
                            model: db.Address,
                            as: 'TradingAddress',
                            required: false
                        },
                        {
                            model: db.AcquirerAccountConfiguration,
                            attributes: ['adyenSubAccountId', 'dnaMid', 'payoutStatus', 'accountStatus']
                        },
                        {
                            model: db.OwnersDetails,
                            attributes: ['email', 'contactPhone']
                        }
                    ]
                });

                allMerchantsByQuery.push(merchantToInclude);
            }

            const merchantsDto = allMerchantsByQuery.map((merchant) => {
                let merchantData = JSON.parse(JSON.stringify(merchant));
                const acquirerAccountConfiguration =
                    merchantData.AcquirerAccountConfigurations && merchantData.AcquirerAccountConfigurations[0];
                const OwnerDetails = merchantData.OwnersDetail;
                return {
                    id: merchant.id,
                    name: merchant.name,
                    status: merchant.status,
                    country: merchant.country,
                    userRole: null,
                    internalTransferStatus: merchant.internalTransferStatus,
                    merchantProductRequired: merchant.MerchantProductRequireds.map((product) => ({
                        id: product.productRequiredId,
                        productName: product.ProductRequired.name,
                        status: product.status,
                        additionalInfo: product.additionalInfo
                    })),
                    label: merchant.label,
                    onboardingStep: merchant.onboardingStep,
                    isClosureRequested: merchant.isClosureRequested,
                    createdAt: merchant.createdAt,
                    postCode: merchant.TradingAddress != null ? merchant.TradingAddress.postCode : null,
                    nameWithAddress: this.formatFullMerchantAddress(merchant),
                    allowWithdrawals: merchant.allowWithdrawals,
                    isStripe: merchant.stripeId ? true : false,
                    canonicalResellerId: merchant.canonicalResellerId,
                    merchantQrId: merchant.merchantQrId,
                    isTestMerchant: merchant.isTestMerchant,
                    autoWithdraw: merchant.autoWithdraw,
                    isAdyenMerchant: acquirerAccountConfiguration
                        ? acquirerAccountConfiguration.adyenSubAccountId
                            ? true
                            : false
                        : false,
                    isDna: acquirerAccountConfiguration ? (acquirerAccountConfiguration.dnaMid ? true : false) : false,
                    payoutStatus: acquirerAccountConfiguration && acquirerAccountConfiguration.payoutStatus,
                    accountStatus: acquirerAccountConfiguration && acquirerAccountConfiguration.accountStatus,
                    isReceiptEnabled: merchant.isReceiptEnabled,
                    isInvoiceEnabled: merchant.isInvoiceEnabled,
                    email: OwnerDetails ? OwnerDetails.email : null,
                    phoneNumber: OwnerDetails ? OwnerDetails.contactPhone : null,
                    vatNumber: merchant.BusinessDetail ? merchant.BusinessDetail.vatNumber : null,
                    merchantType: merchant.merchantType
                };
            });

            return merchantsDto;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getAndCountAdminPendingMerchants(resellerId, searchValue, offset, limit, statusFilter, dateRange) {
        var searchQuery = { resellerId: { [Op.eq]: resellerId } };

        if (searchValue.length > 2) {
            searchValue = '%' + searchValue + '%';

            //Remove all spaces from postcode (before sql query and in sql query)
            const postCodeSearchQuery = db.Sequelize.where(
                db.Sequelize.fn('REPLACE', db.Sequelize.col('Merchant->TradingAddress`.`post_code'), ' ', ''),
                {
                    [Op.like]: searchValue.replace(/ /g, '')
                }
            );

            searchQuery = {
                ...searchQuery,
                [Op.or]: [
                    { '$Merchant.name$': { [Op.like]: searchValue } },
                    { '$Merchant.TradingAddress.post_code$': postCodeSearchQuery },
                    { '$Merchant.id$': { [Op.like]: searchValue } },
                    { '$User.email$': { [Op.like]: searchValue } },
                    { '$User.phone_number$': { [Op.like]: searchValue } }
                ]
            };
        }
        if (statusFilter) {
            searchQuery = {
                ...searchQuery,
                '$Merchant.status$': { [Op.in]: statusFilter }
            };
        }
        if (dateRange) {
            searchQuery = {
                ...searchQuery,
                '$Merchant.created_at$': { [Op.between]: [dateRange.start, dateRange.end] }
            };
        }

        const include = [
            {
                model: db.Merchant,
                where: { name: { [Op.ne]: 'Test Merchant' } },
                include: [
                    {
                        model: db.Address,
                        as: 'TradingAddress',
                        required: false
                    }
                ]
            },
            {
                model: db.User
            }
        ];

        const relationships = await relationshipRepo.findAll({
            attributes: [[db.sequelize.fn('min', db.sequelize.col('Relationship.created_at')), 'completedDate']],
            include: include,
            where: searchQuery,
            group: ['Relationship.merchant_id'],
            raw: true,
            offset: offset ? offset : null,
            limit: limit ? limit : null,
            order: [['Merchant', 'createdAt', 'DESC']]
        });

        const dtoPendingMerchants = relationships.map((relationship) => ({
            id: relationship['Merchant.id'],
            name: relationship['Merchant.name'],
            status: relationship['Merchant.status'],
            thirdPartyCustomerId: relationship['Merchant.thirdPartyCustomer'],
            postCode: relationship['Merchant.TradingAddress.postCode'],
            createdDate: relationship['Merchant.createdAt'],
            completedDate: relationship['completedDate']
        }));

        const countRelationships = await relationshipRepo.count({
            attributes: [
                [db.sequelize.fn('count', db.sequelize.fn('distinct', db.sequelize.col('Merchant.id'))), 'count']
            ],
            include: include,
            where: searchQuery,
            distinct: 'Merchant.id'
        });

        return {
            merchants: dtoPendingMerchants,
            count: countRelationships
        };
    }

    async getAllMerchantsForReseller(resellerId, data) {
        const { offset, limit, canonicalResellerId, statusFilter, productFilter } = data;
        let merchantSearchWhereQuery;
        var searchValue = data.searchValue;
        if (searchValue.length > 2) {
            searchValue = '%' + searchValue + '%';
        } else {
            searchValue = '%';
        }

        merchantSearchWhereQuery = {
            [Op.or]: [
                { '$Merchant.name$': { [Op.like]: searchValue } },
                { '$Merchant.id$': { [Op.like]: searchValue } }
            ]
        };

        let merchantProductWhereQuery = {};
        if (productFilter !== 'all') {
            merchantProductWhereQuery = {
                productRequiredId: ProductsRequiredNamesToId[productFilter]
            };
        }

        let includeParams = [
            {
                model: db.Relationship,
                where: {
                    resellerId: resellerId
                },
                attributes: []
            },
            {
                model: db.Address,
                as: 'BaseAddress',
                required: false
            },
            {
                model: db.MerchantProductRequired,
                attributes: ['id'],
                where: merchantProductWhereQuery,
                required: productFilter !== 'all'
            },
            {
                model: db.MerchantProductRequired,
                as: 'MerchantProducts',
                attributes: ['id'],
                include: [
                    {
                        model: db.ProductRequired,
                        attributes: ['name']
                    }
                ]
            }
        ];
        if (statusFilter && statusFilter.length) {
            merchantSearchWhereQuery = {
                ...merchantSearchWhereQuery,
                '$Merchant.status$': { [Op.in]: statusFilter }
            };
        }

        if (canonicalResellerId) {
            merchantSearchWhereQuery.canonicalResellerId = canonicalResellerId;
            includeParams = [
                {
                    model: db.Address,
                    as: 'BaseAddress',
                    required: false
                },
                {
                    model: db.PaymentsConfiguration,
                    required: false,
                    attributes: ['acquirerBank']
                },
                {
                    model: db.MerchantProductRequired,
                    where: merchantProductWhereQuery,
                    attributes: ['id'],
                    required: productFilter !== 'all'
                },
                {
                    model: db.MerchantProductRequired,
                    as: 'MerchantProducts',
                    attributes: ['id'],
                    include: [
                        {
                            model: db.ProductRequired,
                            attributes: ['name']
                        }
                    ]
                }
            ];
        }

        const merchants = await merchantRepo.findAll({
            where: merchantSearchWhereQuery,
            include: includeParams,
            offset: offset ? offset : null,
            limit: limit ? limit : null,
            order: [['id', 'DESC']],
            attributes: ['id', 'name', 'status']
        });

        const requiredProduct = productFilter === 'all' ? null : ProductsRequiredNamesToId[productFilter];
        let dtoMerchants = merchants.map((merchant) => {
            const merchantProductRequiredList = [];
            merchant.MerchantProducts.forEach((product) => {
                merchantProductRequiredList.push(product.ProductRequired.name);
            });
            const merchantPaymentConfig =
                merchant.PaymentsConfiguration && JSON.parse(JSON.stringify(merchant.PaymentsConfiguration));
            return {
                id: merchant.id,
                name: merchant.name,
                status: merchant.status,
                address: merchant.BaseAddress != null ? merchant.BaseAddress : null,
                acquirerBank: merchantPaymentConfig ? merchantPaymentConfig.acquirerBank : null,
                merchantProductRequired: merchantProductRequiredList
            };
        });
        if (requiredProduct) {
            dtoMerchants = dtoMerchants.filter((merchant) => {
                return merchant.merchantProductRequired.includes(productFilter);
            });
        }
        return dtoMerchants;
    }

    async countAllMerchantsForReseller(resellerId, data) {
        var canonicalResellerId = data.canonicalResellerId;
        var searchValue = data.searchValue;
        var statusFilter = data.statusFilter;
        let productFilter = data.productFilter;
        if (searchValue.length > 2) {
            searchValue = '%' + searchValue + '%';
        } else {
            searchValue = '%';
        }

        const ownerRole = await userRoleRepo.findOne({
            where: {
                name: models.UserRole.OWNER
            }
        });

        let merchantSearchWhereQuery = {
            [Op.or]: [
                { '$Merchant.name$': { [Op.like]: searchValue } },
                { '$Merchant.id$': { [Op.like]: searchValue } }
            ]
        };
        let merchantProductWhereQuery = {};
        if (productFilter !== 'all') {
            merchantProductWhereQuery = {
                productRequiredId: ProductsRequiredNamesToId[productFilter]
            };
        }
        let includeParams = [
            {
                model: db.Relationship,
                where: {
                    resellerId: resellerId,
                    roleId: ownerRole.id
                }
            },
            {
                model: db.MerchantProductRequired,
                where: merchantProductWhereQuery,
                required: productFilter !== 'all'
            }
        ];

        if (statusFilter && statusFilter.length) {
            merchantSearchWhereQuery = {
                ...merchantSearchWhereQuery,
                '$Merchant.status$': { [Op.in]: statusFilter }
            };
        }
        if (canonicalResellerId) {
            merchantSearchWhereQuery.canonicalResellerId = canonicalResellerId;
            includeParams = [];
            if (productFilter !== 'all') {
                includeParams = [
                    {
                        model: db.MerchantProductRequired,
                        where: merchantProductWhereQuery,
                        required: productFilter !== 'all'
                    }
                ];
            }
        }
        return await merchantRepo.count({
            where: merchantSearchWhereQuery,
            include: includeParams
        });
    }

    async delete(merchantId) {
        return await merchantRepo.delete({
            where: {
                id: merchantId
            }
        });
    }

    async requestClose(merchantId) {
        return await merchantRepo.update(merchantId, {
            isClosureRequested: true
        });
    }
    async updateMerchantData(merchantId, accountStatus) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();

            await merchantRepo.update(
                merchantId,
                {
                    accountStatus: accountStatus
                },
                transaction
            );

            await transaction.commit();
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            throw error;
        }
    }

    /**
     * @description sent email notification on "Allow Withdrawals" override status changes to NO,
     *  bank and account is unverified
     *
     * @param { Merchant } updatedMerchant
     * @param { Merchant } merchant
     * @param { number } resellerId
     * @returns {Promise<void>}
     */
    async sendAccountUnverifiedEmail(updatedMerchant, merchant, resellerId) {
        const reseller = await resellerRepo.findOne({ where: { id: resellerId } });
        const relationship = await relationshipRepo.findOne({ where: { merchantId: merchant.id } });
        const user = await userRepo.findByPk(relationship.userId);

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

        const emailTemplate = merchantAccountUnverifiedEmailTemplate(resellerBrandingObj);
        await sendEmail({
            email: user.email,
            subject: 'Verify your Account',
            message: emailTemplate,
            resellerBrandingObj
        });
    }

    /**
     * Format merchant name, avoid case with null prop
     * Ex: KFW - {null} - 2332
     * @param {{}} merchant
     */
    formatFullMerchantAddress(merchant) {
        let fullMerchantName = merchant.name;

        if (merchant.TradingAddress) {
            if (merchant.TradingAddress.city) {
                fullMerchantName += ` - ${merchant.TradingAddress.city}`;
            }
            if (merchant.TradingAddress.postCode) {
                fullMerchantName += ` - ${merchant.TradingAddress.postCode}`;
            }
        }

        return fullMerchantName;
    }

    // update merchant name
    async updateMerchantInfo(merchantId, newMerchantName, newCountry) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();

            await merchantRepo.update(
                merchantId,
                {
                    name: newMerchantName,
                    country: newCountry
                },
                transaction
            );

            await transaction.commit();

            const merchantInfo = {
                name: newMerchantName,
                country: newCountry
            };

            return merchantInfo;
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            throw error;
        }
    }

    async merchantEnableAutoWithdrawal(merchantId, enable) {
        let transaction;

        try {
            transaction = await db.sequelize.transaction();
            await merchantRepo.update(
                merchantId,
                {
                    autoWithdraw: enable
                },
                transaction
            );
            await transaction.commit();
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            throw error;
        }
    }
}
