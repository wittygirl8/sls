require('dotenv').config();
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');

var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
const { MerchantRepo, OwnersDetailsRepo } = require('../../../libs/repo');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

const { Op } = db.Sequelize;
const merchantRepo = new MerchantRepo(db);
const ownersDetailsRepo = new OwnersDetailsRepo(db);

const { DocumentTypesId } = require('../helpers/documentType');
export class GetMissingData {
    async getMissingMerchant(event, resellerId, offset, searchValue, limit, isAdyen) {
        let searchQuery;

        if (searchValue.length > 2) {
            searchValue = '%' + searchValue + '%';
            console.log(searchValue, 'srt');

            searchQuery = {
                ...searchQuery,
                [Op.or]: [
                    { '$Merchant.name$': { [Op.like]: searchValue } },
                    { '$Merchant.id$': { [Op.like]: searchValue } }
                ]
            };
        }
        let includeQuery = [
            {
                model: db.OwnersDetails,
                where: {
                    [Op.or]: [
                        { nationality: null },
                        { birthDate: null },
                        { nationality: { [Op.like]: '' } },
                        { birthDate: { [Op.like]: '' } }
                    ]
                },
                attributes: ['nationality', 'birthDate', 'owner_address_id'],
                include: [
                    {
                        model: db.Address,
                        as: 'OwnerAddress',
                        attributes: ['postCode']
                    }
                ]
            },
            {
                model: db.Document,
                where: {
                    status: { [Op.in]: ['NEED_APPROVAL', 'ACTIVE'] },
                    documentTypeId: {
                        [Op.in]: [DocumentTypesId.PASSPORT, DocumentTypesId.DRIVING_LICENCE]
                    }
                },
                attributes: ['id']
            },
            {
                model: db.Relationship,
                where: {
                    resellerId: resellerId
                },
                attributes: ['id']
            }
        ];

        if (isAdyen) {
            includeQuery = [
                ...includeQuery,
                {
                    model: db.AcquirerAccountConfiguration,
                    attributes: ['adyenSubAccountId'],
                    required: true
                }
            ];
        }

        const ownerId = await merchantRepo.findAll({
            attributes: [['id', 'MerchantId'], ['name', 'MerchantName'], 'legalName', 'status'],
            include: includeQuery,
            offset: offset ? offset : null,
            limit: limit ? limit : null,
            where: searchQuery
        });

        const countMerchants = await merchantRepo.count({
            include: includeQuery,
            distinct: 'id',
            where: searchQuery
        });

        const data = {
            ownerId: ownerId,
            count: countMerchants
        };

        return data;
    }

    async getMerchantInfo(merchantId) {
        const data = await merchantRepo.findAll({
            where: {
                id: merchantId
            },
            order: [[db.Document, 'created_at', 'DESC']],
            attributes: ['legalName', ['id', 'MerchantId']],
            include: [
                {
                    model: db.OwnersDetails,
                    attributes: ['nationality', 'birthDate']
                },
                {
                    model: db.Document,
                    where: {
                        merchantId: merchantId,
                        status: { [Op.in]: ['NEED_APPROVAL', 'ACTIVE'] },
                        documentTypeId: {
                            [Op.in]: [DocumentTypesId.PASSPORT, DocumentTypesId.DRIVING_LICENCE]
                        }
                    },
                    required: false,
                    attributes: [
                        [db.sequelize.literal('cast(`Documents`.`id` as CHAR(500))'), 'id'],
                        'filename',
                        'size',
                        'flag',
                        'documentTypeId',
                        'status',
                        'merchantId',
                        'created_at'
                    ]
                }
            ]
        });

        return data;
    }

    async updateMissingData(event) {
        try {
            const body = JSON.parse(event.body);

            const merchant = await merchantRepo.findOne({
                where: {
                    id: body.merchantId
                }
            });

            if (!merchant) {
                return response({}, 404);
            }

            await ownersDetailsRepo.update(merchant.primaryOwnerId, {
                nationality: body.nationality,
                birthDate: body.DOB
            });
        } catch (err) {
            console.log(err);
            throw err;
        }
    }
}
