'use strict';
require('dotenv').config();
global.fetch = require('node-fetch').default;

var { response } = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../../layers/models_lib/src') : require('models');
const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

export const getRoles = async () => {
    try {
        const { Role } = db;
        const roles = await Role.findAll();
        return response({ roles });
    } catch (error) {
        return response({ error }, 500);
    }
};
