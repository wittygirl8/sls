'use strict';
require('dotenv').config();
global.fetch = require('node-fetch').default;

const { CognitoUserPool, CognitoUserAttribute } = require('amazon-cognito-identity-js');
var { response, models } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);
var { ResellerRepo } = require('../../../libs/repo');
const resellerRepo = new ResellerRepo(db);

const poolData = {
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    ClientId: process.env.COGNITO_CLIENT_ID
};
const userPool = new CognitoUserPool(poolData);

export const signUp = async (event) => {
    const { User, sequelize, Merchant, Relationship, Role, UserType } = db;

    if (!event.body) {
        const result = response({}, 400);
        return result;
    }
    let transactionRds;
    const transaction = await sequelize.transaction();

    let body = JSON.parse(event.body);
    const userType = await UserType.findOne({
        where: {
            name: 'Merchant'
        }
    });
    body.typeId = userType.id;

    try {
        var usersCount = await User.count({
            where: {
                email: body.email
            }
        });

        if (usersCount > 0) {
            return response(
                {
                    error: 'User already exists'
                },
                400
            );
        }

        body.isDisable = false;

        const user = await User.create(body, { transaction: transaction });

        if (body.userType === models.UserType.MERCHANT) {
            var userRole = await Role.findOne({
                where: {
                    name: 'Owner'
                }
            });

            const resellers = await resellerRepo.findAll();
            const promises = resellers.map(async (reseller) => {
                const merchant = await Merchant.create(
                    {
                        name: 'Test Merchant'
                    },
                    { transaction: transaction }
                );

                await Relationship.create(
                    {
                        userId: user.id,
                        merchantId: merchant.id,
                        roleId: userRole.id,
                        resellerId: reseller.id
                    },
                    { transaction: transaction }
                );
            });

            await Promise.all(promises);
        }

        const cognitoresponse = await signUpUserInCognito(body);

        const cognitoMyPayRelations = {
            userId: user.id,
            providerId: cognitoresponse.cignitoUserId,
            providerName: 'AWS Cognito'
        };

        await db.IdentityProviderMyPayRelations.create(cognitoMyPayRelations, {
            transaction: transaction
        });

        if (cognitoresponse.statusCode !== 201) {
            await transaction.rollback();
            return response(cognitoresponse, cognitoresponse.statusCode);
        } else {
            await transaction.commit();
            ///TODO: This code needed for creation user in both plase local db and cognitodb:
            ///problem is in login PreTokenGeneration method.
            ///When we create user local we don't have this user in AWS db
            ///PreTokenGeneration method will run only on aws and it will initiate query
            /// in AWS database, which don't have user that we created localy and it will throw error

            if (process.env.IS_OFFLINE) {
                const dbCognito = connectDB(
                    process.env.DB_RESOURCE_ARN,
                    process.env.INFRA_STAGE + '_database',
                    '',
                    process.env.SECRET_ARN,
                    false
                );

                transactionRds = await dbCognito.sequelize.transaction();

                const userTypeCognito = await dbCognito.UserType.findOne({
                    where: {
                        name: body.userType
                    }
                });

                if (!userTypeCognito) {
                    await transactionRds.rollback();
                }

                body.typeId = userTypeCognito.id;

                body.id = user.id;
                await dbCognito.User.create(body, { transaction: transactionRds });

                await dbCognito.IdentityProviderMyPayRelations.create(cognitoMyPayRelations, {
                    transaction: transactionRds
                });
                await transactionRds.commit();
            }
            return response({}, 201);
        }
    } catch (error) {
        console.error(error);
        await transaction.rollback();
        await transactionRds.rollback();
        const result = response('Internal server error', 500);
        return result;
    }
};

const signUpUserInCognito = (body) => {
    return new Promise((resolve) => {
        let attributeList = [];
        attributeList.push(new CognitoUserAttribute({ Name: 'email', Value: body.email }));
        attributeList.push(new CognitoUserAttribute({ Name: 'custom:roles', Value: 'ROLE_ADMIN,ROLE_MANAGER' }));
        attributeList.push(
            new CognitoUserAttribute({
                Name: 'custom:permissions',
                Value: 'ADD_USER,UPDATE_USER,DELETE_USER,VIEW_ALL'
            })
        );

        userPool.signUp(body.username, body.password, attributeList, null, (err, result) => {
            if (err) {
                console.error('User Pool SignUp:', err);
                const errorresponse = { error: 'Internal server error', statusCode: 400 };
                resolve(errorresponse);
            } else {
                const successresponse = { cignitoUserId: result.userSub, statusCode: 201 };
                resolve(successresponse);
            }
        });
    });
};
