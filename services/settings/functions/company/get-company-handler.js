require('dotenv').config();

const { response } = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');
const { CompanyService } = require('../../business-logic/company.service');

const companyService = new CompanyService();

export const getProfile = async (event) => {
    try {
        const companyRegistrationNumber = event.pathParameters.companyRegistrationNumber;
        let result = await companyService.getProfile(companyRegistrationNumber);

        return response(result.data, 200);
    }
    catch (error) {
        console.log(error);
        return response({}, 500);
    }
};

export const getPersonsWithSignificantControl = async (event) => {
    try {
        const companyRegistrationNumber = event.pathParameters.companyRegistrationNumber;
        let result = await companyService.getPersonsWithSignificantControl(companyRegistrationNumber);

        return response(result.data, 200);
    }
    catch (error) {
        console.log(error);
        return response({}, 500);
    }
};

export const getCompaniesDetail = async (event) => {
    try {
        const queryParameters = event.queryStringParameters;
        let result = await companyService.getCompaniesDetail(queryParameters);

        return response(result.data, 200);
    }
    catch (error) {
        console.log(error);
        return response({}, 500);
    }
};
