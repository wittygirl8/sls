'use strict';
require('dotenv').config();
global.fetch = require('node-fetch').default;

var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

import { createUserWithTemporaryPassword } from '../../../layers/helper_lib/src';

var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');

export const createUser = async (event) => {
    try {
        createUserWithTemporaryPassword(event, db, connectDB, false);

        return response({}, 201);
    } catch (error) {
        return response({ error }, 500);
    }
};
