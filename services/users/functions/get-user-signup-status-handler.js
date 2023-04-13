'use strict';

var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);
const { UserRepo } = require('../../../libs/repo');
const userRepo = new UserRepo(db);

export const getUserSignupStatus = async (event) => {
    const email = event.pathParameters.email;

    try {
        const users = await userRepo.findOne({
            where: { email: email },
            attributes: ['signupStatus']
        });

        return response(users, 200);
    } catch (error) {
        console.error('Error', error);
        return response({ error }, 500);
    }
};
