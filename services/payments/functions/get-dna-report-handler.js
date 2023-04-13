require('dotenv').config();

var { response, middy, userAccessValidatorMiddleware } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
const { DNAreportService } = require('../business-logic/dna-report.service');
const dnaReportService = new DNAreportService();

export const getDNAreport = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.merchantId;
        const body = JSON.parse(event.body);
        const dnaReportResponse = await dnaReportService.getDnaRreport(merchantId, body);
        return dnaReportResponse;
    } catch (err) {
        console.log(err);
        return response({}, 500);
    }
}).use(userAccessValidatorMiddleware());
