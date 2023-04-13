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

export const getUser = async (event) => {
    const { User } = db;

    const property = event.pathParameters.property;
    const value = event.pathParameters.value;

    try {
        var filterObject = {};
        filterObject[property] = value;

        const users = await User.findAll({
            where: filterObject,
            attributes: {
                exclude: ['emailConfirmationToken', 'refreshToken', 'updated_at', 'created_at']
            },
            include: [
                {
                    model: db.UserType,
                    attributes: ['name']
                },
                {
                    model: db.Relationship,
                    include: [
                        {
                            model: db.Role,
                            attributes: ['name']
                        }
                    ]
                }
            ]
        });

        if (users.length === 0) {
            return response({ error: 'User not found' }, 404);
        }
        return response(users, 200);
    } catch (error) {
        console.error('Error', error);
        return response({ error }, 500);
    }
};
