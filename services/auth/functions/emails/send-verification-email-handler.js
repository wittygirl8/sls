require('dotenv').config();

var { response } = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../../layers/models_lib/src') : require('models');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);
const { UserRepo } = require('../../../../libs/repo');

const { v4: uuidv4 } = require('uuid');

const userRepo = new UserRepo(db);

import { AuthService } from '../../business-logic/auth.service';
const authService = new AuthService();

export const sendVerificationEmail = async (event) => {
    let transaction;
    try {
        const body = JSON.parse(event.body);
        const email = body.email;
        const resellerPortalUrl = body.resellerUrl;
        const user = await userRepo.findOne({ where: { email: email } });

        transaction = await db.sequelize.transaction();

        if (!user) {
            return response({}, 404);
        }

        await userRepo.updateById(
            user.id,
            {
                emailConfirmationToken: uuidv4()
            },
            transaction
        );

        await transaction.commit();

        await authService.sendEmailConfirmationMessage(email, resellerPortalUrl);

        return response({});
    } catch (err) {
        if (transaction) {
            await transaction.rollback();
        }
        console.error(err);
        return response({ err }, 500);
    }
};
