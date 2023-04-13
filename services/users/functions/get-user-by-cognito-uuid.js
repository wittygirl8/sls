('use strict');

var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

export const getUserByCognitoUserName = async (event) => {
    const cognitoUuid = event.pathParameters.cognitoUuid;
    const { User, IdentityProviderMyPayRelations } = db;

    try {
        const identityProviderMyPayRelations = await IdentityProviderMyPayRelations.findOne({
            where: { providerId: cognitoUuid }
        });

        if (!identityProviderMyPayRelations) {
            return response({ error: 'User not found' }, 404);
        }

        const userId = identityProviderMyPayRelations.userId;

        const users = await User.findAll({
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
            ],
            where: { id: userId }
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
