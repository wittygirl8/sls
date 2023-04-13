var { response, middy, models, userTypesValidatorMiddleware } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { AuditData } = require('../business-logic/audit-log-data-service');

const auditData = new AuditData();
const { UserType } = models;
export const auditLogDataForAdmin = middy(async (event) => {
    try {
        const body = JSON.parse(event.body);

        const resellerId = event.pathParameters.resellerId;
        const { offset, limit, searchValue } = body;

        const data = await auditData.fetchAuditLogData(offset, limit, resellerId, searchValue);

        return response({ data: data.auditData, count: data.count }, 200);
    } catch (err) {
        console.error(err);
        return response('An error occurred, please contact support or try again', 500);
    }
}).use(userTypesValidatorMiddleware([UserType.SUPER_ADMIN]));
