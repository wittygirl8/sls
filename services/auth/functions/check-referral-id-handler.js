var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
const { AuthService } = require('../business-logic/auth.service');

const authService = new AuthService();

export async function main(event) {
    try {
        const thirdPartyId = event.pathParameters.thirdPartyCustomerId;

        const isThitdPartyIdExist = await authService.checkIfThirdPartyCustomerIdExistInSystem(thirdPartyId);

        return response({ isThitdPartyIdExist });
    } catch (err) {
        console.error(err);
        return response({ message: 'An error occurred, please contact support' }, 500);
    }
}
