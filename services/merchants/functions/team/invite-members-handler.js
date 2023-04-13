'use strict';
require('dotenv').config();
global.fetch = require('node-fetch').default;

import { TeamService } from '../../business-logic/team.service';
var { response } = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');

const teamService = new TeamService();

/**
 * @description Invite Users to the selected Merchant either the user is registered or not
 * @param { {} } event Request event
 */
export const inviteMembers = async (event) => {
    try {
        await teamService.InviteMembers(event);

        return response({}, 200);
    } catch (error) {
        return response({ error: error }, 500);
    }
};
