var { response } = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');

import { AuthService } from '../../business-logic/auth.service';
import { RefreshTokenService } from '../../business-logic/refresh-token.service';

export const saveRefreshToken = async (event) => {
    const authService = new AuthService();
    const refreshTokenService = new RefreshTokenService();

    try {
        const body = JSON.parse(event.body);
        const refreshToken = body.refreshToken;
        const userId = await refreshTokenService.getUserIdFromVerifiedRefreshToken(event);

        await authService.saveRefreshToken(userId, refreshToken);
        return response(null);
    } catch (err) {
        return response(null, 500);
    }
};
