require('dotenv').config();

const { response } = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');
const { AddressService } = require('../../business-logic/address.service');

const addressService = new AddressService();

export const getAddress = async (event) => {
    try {
        const parameters = event.queryStringParameters;
        const { postCode } = parameters;
        let result = await addressService.findByPostCode(postCode);

        return response(result.data, 200);
    }
    catch (error) {
        if (error.response.status === 400) {
            return response(error.response.data.Message, 400);
        }
        console.log(error);
        return response({}, 500);
    }
};
