var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');

const { AuditLogGroupRepo } = require('../../../libs/repo');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);
const { Op } = db.Sequelize;

const auditLogGroup = new AuditLogGroupRepo(db);
export class AuditData {
    async fetchAuditLogData(offset, limit, resellerId, searchValue) {
        let searchQuery = { canonicalResellerId: resellerId };

        if (searchValue.length > 2) {
            searchValue = '%' + searchValue + '%';

            searchQuery = {
                ...searchQuery,
                [Op.or]: [{ $name$: { [Op.like]: searchValue } }, { '$Merchant.id$': { [Op.like]: searchValue } }]
            };
        }

        const include = [
            {
                model: db.Merchant,
                where: searchQuery,
                attributes: ['name']
            },
            {
                model: db.User,

                attributes: ['first_name', 'last_name']
            },
            {
                model: db.AuditLogItem,
                attributes: ['field_modified', 'current_value', 'new_value', 'log_id', 'table_name', 'primary_key'],
                required: true
            }
        ];

        const auditData = await auditLogGroup.findAll({
            attributes: ['id', 'user_id', 'merchant_id', 'ip_address', 'created_at', 'lambada_function'],
            include: include,
            offset: offset ? offset : null,
            limit: limit ? limit : null
        });
        const count = await auditLogGroup.count({
            include: include
        });

        const auditDto = await auditData.map((data) => {
            let audit = JSON.parse(JSON.stringify(data));
            return {
                id: audit.id,
                mid: audit.merchant_id,
                name: audit.Merchant.name,
                ip_address: audit.ip_address,
                function_name: audit.lambada_function,
                updated_date: audit.created_at,
                userName: `${audit.User?.first_name} ${audit.User?.last_name}`,
                auditData: data.AuditLogItems
            };
        });

        return { auditData: auditDto, count: count };
    }
}
