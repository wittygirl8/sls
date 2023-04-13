import Axios from 'axios';

const COMPANIES_HOUSE_API_KEY = process.env.COMPANIES_HOUSE_API_KEY;

export class CompanyService {
    async getProfile(companyRegistrationNumber) {
        const axios = Axios.create();
        const config = {
            method: 'get',
            url: `https://api.companieshouse.gov.uk/company/${companyRegistrationNumber}`,
            headers: {
                Authorization: `Basic ${COMPANIES_HOUSE_API_KEY}`
            }
        };
        return axios(config);
    }

    async getPersonsWithSignificantControl(companyRegistrationNumber) {
        const axios = Axios.create();
        const config = {
            method: 'get',
            url: `https://api.companieshouse.gov.uk/company/${companyRegistrationNumber}/persons-with-significant-control`,
            headers: {
                Authorization: `Basic ${COMPANIES_HOUSE_API_KEY}`
            }
        };

        return axios(config);
    }

    async getCompaniesDetail(queryParameters) {
        const instance = Axios.create();
        const queryParametersString = new URLSearchParams(queryParameters);
        const config = {
            method: 'get',
            url: `https://api.companieshouse.gov.uk/search/companies?${queryParametersString}`,
            headers: {
                Authorization: `Basic ${COMPANIES_HOUSE_API_KEY}`
            }
        };
        return instance(config);
    }
}
