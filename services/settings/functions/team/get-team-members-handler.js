require('dotenv').config();

var { response, userAccessValidatorMiddleware, middy } = process.env.IS_OFFLINE
    ? require('../../../../layers/helper_lib/src')
    : require('mypay-helpers');

var { TeamService } = require('../../business-logic/team.service');

const teamService = new TeamService();

export const getTeamMembers = middy(async (event) => {
    try {
        const merchantId = event.pathParameters.id;

        const relatedUsers = await teamService.getRelationshipsByMerchantId(merchantId);

        const usersIds = relatedUsers.map((r) => r.userId);

        const teamMembers = await teamService.getUsersByIds(usersIds, merchantId);

        return response({ teamMembers });
    } catch (error) {
        return response({}, 500);
    }
}).use(userAccessValidatorMiddleware('id'));
