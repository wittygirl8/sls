var { response } = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');

import { AuthService } from '../../business-logic/auth.service';
import { RefreshTokenService } from '../../business-logic/refresh-token.service';

export const deleteRefreshToken = async (event) => {
    const authService = new AuthService();
    const refreshTokenService = new RefreshTokenService();

    try {
        const userId = await refreshTokenService.getUserIdFromVerifiedRefreshToken(event);

        await authService.deleteRefreshToken(userId);
        return response({});
    } catch (err) {
        console.error(err);
        return response(null, 500);
    }
};
