import * as jwt from 'jsonwebtoken';
const jwkToPem = require('jwk-to-pem');
const axios = require('axios');
const iss = `https://cognito-idp.${process.env.REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`;
export class RefreshTokenService {
    async getUserIdFromVerifiedRefreshToken(event) {
        try {
            const token = event.headers['Authorization']
                .replace(/['"]+/g, '')
                .replace(/Bearer/g, '')
                .trim();

            const decodedJwt = jwt.decode(token, { complete: true });

            var kid = decodedJwt.header.kid;

            //generate pem keys of respective env
            const response = await axios.get(`${iss}/.well-known/jwks.json`);
            if (response.status === 200) {
                console.log('getPems success');
                var pems = {};
                var keys = response.data.keys;
                for (var i = 0; i < keys.length; i++) {
                    //Convert each key to PEM
                    var key_id = keys[i].kid;
                    var modulus = keys[i].n;
                    var exponent = keys[i].e;
                    var key_type = keys[i].kty;
                    var jwk = { kty: key_type, n: modulus, e: exponent };
                    var kid_pem = jwkToPem(jwk);
                    pems[key_id] = kid_pem;
                }
            }

            //map pem key with token kid
            var pem = pems[kid];
            if (!pem) {
                console.log('Invalid access token', kid);
                throw { message: 'Invalid access token' };
            }
            //Verify the signature of the JWT token to ensure it's really generated from User Pool
            const result = jwt.verify(token, pem, { issuer: decodedJwt.payload.iss, ignoreExpiration: true });

            //return userId
            return result['myPayUserId'];
        } catch (e) {
            console.log(e);
            throw new Error('Token decode failed');
        }
    }
}
