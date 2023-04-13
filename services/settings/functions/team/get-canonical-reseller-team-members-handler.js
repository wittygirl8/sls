require('dotenv').config();

var { response, middy, userTypesValidatorMiddleware, models } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');

var { TeamService } = require('../../business-logic/team.service');

const teamService = new TeamService();
const { UserType } = models;

export const getCanonicalResellerTeamMembers = middy(async (event) => {
    try {
        const canonicalResellerId = event.pathParameters.id;

        const relatedUsers = await teamService.getRelationshipsByCanonicalResellerId(canonicalResellerId);

        const usersIds = relatedUsers.map((r) => r.userId);

        let teamMembers = await teamService.getUsersByIds(usersIds, null);

        return response({ teamMembers });
    } catch (error) {
        return response({}, 500);
    }
}).use(userTypesValidatorMiddleware([UserType.RESELLER]));
