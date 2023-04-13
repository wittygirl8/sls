var { response } = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');

import { AuthService } from '../../business-logic/auth.service';
import { RefreshTokenService } from '../../business-logic/refresh-token.service';

export const getRefreshToken = async (event) => {
    const authService = new AuthService();
    const refreshTokenService = new RefreshTokenService();

    try {
        const userId = await refreshTokenService.getUserIdFromVerifiedRefreshToken(event);

        const refresToken = await authService.getRefreshToken(userId);
        return response(refresToken);
    } catch (err) {
        console.log(err);
        return response(null, 500);
    }
};
