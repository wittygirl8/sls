require('dotenv').config();

var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
var { ResellerRepo } = require('../../../libs/repo/reseller.repo');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

const resellerRepo = new ResellerRepo(db);

export const getResellers = async () => {
    try {
        const resellers = await resellerRepo.findAll();

        const resellersDto = resellers.map((reseller) => {
            return {
                id: reseller.id,
                name: reseller.name,
                logo: reseller.logo,
                portalURL: reseller.portalURL,
                helpPageURL: reseller.helpPageURL,
                termAndCondPageURL: reseller.termAndCondPageURL,
                portalTitle: reseller.portalTitle,
                faviconLink: reseller.faviconLink,
                address: reseller.address
            };
        });

        return response(resellersDto);
    } catch (err) {
        console.log(err);
        return response({}, 500);
    }
};
