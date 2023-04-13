require('dotenv').config();

var { response } = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');

var { TeamService } = require('../../business-logic/team.service');

const teamService = new TeamService();

export const deleteTeamMember = async (event) => {
    try {
        const relationshipId = event.pathParameters && event.pathParameters.id;
        let body = {};

        if (event.body) {
            body = JSON.parse(event.body);
        }

        const result = await teamService.deleteRelationship(relationshipId, body.canonicalResellerId);
        return response({ result });
    } catch (error) {
        console.log(error, event);
        return response({}, 500);
    }
};
