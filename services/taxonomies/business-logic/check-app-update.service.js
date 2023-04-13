var AWS = require('aws-sdk');
var ssm = new AWS.SSM({ region: process.env.REGION });

export class CheckAppUpdateService {
    async getSsmParameter(options) {
        try {
            let res = await ssm.getParameter(options).promise();
            return res?.Parameter?.Value;
        } catch (ex) {
            console.log('Something went wrong while fetching SSM parameter', ex, 'Options were', options);
            return 'Error';
        }
    }
}
