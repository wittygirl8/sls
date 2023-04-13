'use strict';
require('dotenv').config();
global.fetch = require('node-fetch').default;

var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const AWS = require('aws-sdk');
const _ = require('lodash');
const cognitoServiceProvider = new AWS.CognitoIdentityServiceProvider();
const userPoolId = process.env.COGNITO_USER_POOL_ID;

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

var { response, middy, userTypesValidatorMiddleware, models, auditLogsPublisher, getUserId } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
const { UserType } = models;

export const updateUser = middy(async (event) => {
    let transaction;

    try {
        const { sequelize, User, Relationship } = db;

        if (!event.body) {
            const result = response({ error: 'Missing body' }, 400);
            return result;
        }

        const userId = await getUserId(event);

        let { email, newEmail, newPhoneNumber, newFirstName, newLastName } = JSON.parse(event.body);

        transaction = await sequelize.transaction();

        let existingUserWithEmail = await User.findOne({
            where: {
                email: email
            }
        });

        if (!existingUserWithEmail) {
            return response({ error: `User doesn't exist.` }, 400);
        }

        if (newEmail) {
            let existingUserWithNewEmail = await User.findOne({
                where: {
                    email: newEmail
                }
            });

            if (existingUserWithNewEmail) {
                return response({ error: `User with the new email already exists.` }, 400);
            }
        }

        let cognitoReqParams = {
            UserAttributes: [],
            UserPoolId: userPoolId,
            Username: email
        };

        let dbUpdateQuery = {};

        if (newEmail) {
            cognitoReqParams.UserAttributes = cognitoReqParams.UserAttributes.concat([
                {
                    Name: 'email',
                    Value: newEmail
                },
                {
                    Name: 'email_verified',
                    Value: 'true'
                }
            ]);

            dbUpdateQuery.email = newEmail;
            dbUpdateQuery.isEmailConfirmed = true;
        }

        if (newPhoneNumber) {
            cognitoReqParams.UserAttributes = cognitoReqParams.UserAttributes.concat([
                {
                    Name: 'phone_number',
                    Value: newPhoneNumber
                },
                {
                    Name: 'phone_number_verified',
                    Value: 'true'
                }
            ]);
            dbUpdateQuery.phoneNumber = newPhoneNumber;
        }

        if (newFirstName && newLastName) {
            cognitoReqParams.UserAttributes = cognitoReqParams.UserAttributes.concat([
                {
                    Name: 'given_name',
                    Value: newFirstName
                },
                {
                    Name: 'family_name',
                    Value: newLastName
                }
            ]);

            dbUpdateQuery.firstName = newFirstName;
            dbUpdateQuery.lastName = newLastName;
        }

        await updateUserInCognito(cognitoReqParams);
        if (!_.isEmpty(dbUpdateQuery)) {
            await User.update(
                dbUpdateQuery,
                {
                    where: { email: email }
                },
                { transaction: transaction }
            );

            const updatedUser = await User.findOne({
                where: {
                    id: existingUserWithEmail.id
                }
            });

            const updatedUserDto = {
                beforeUpdate: existingUserWithEmail,
                afterUpdate: updatedUser,
                tableName: 'users'
            };

            const relationShip = await Relationship.findOne({ where: { userId: existingUserWithEmail.id } });
            const auditLogData = [updatedUserDto];

            const auditLogDto = {
                data: {
                    auditLogData,
                    userId: userId,
                    merchantId: relationShip.merchantId,
                    lambadaName: 'Update',
                    identity: event.requestContext.identity
                },
                queueUrl: process.env.AUDIT_LOGS_QUEUE_URL
            };
            await auditLogsPublisher(auditLogDto);
        }

        await transaction.commit();

        return response({}, 200);
    } catch (error) {
        console.log(error);
        transaction.rollback();
        return response({ error }, 500);
    }
}).use(userTypesValidatorMiddleware([UserType.ADMIN]));

const updateUserInCognito = (params) => {
    return new Promise((resolve, reject) => {
        cognitoServiceProvider.adminUpdateUserAttributes(params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};
