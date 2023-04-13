var atob = require('atob');
var phpSerialize = require('php-serialize');
const crypto = require('crypto');

export const signUpValidation = async (base64, signature, userEmail) => {
    const hmacSignature = crypto.createHmac('sha256', process.env.HMAC_SECRECT).update(base64).digest('hex');
    if (signature === hmacSignature) {
        console.log('Request successfully verified by sha256');
        let data;
        try {
            data = JSON.parse(atob(base64));
        } catch (error1) {
            try {
                data = phpSerialize.unserialize(atob(base64));
            } catch (error2) {
                console.log('error2', error2);
                new Error('Unauthorized Request');
            }
        }
        const email = data.OwnerEmail.toLowerCase().replace(/ /g, '');
        const signUpEmail = userEmail.toLowerCase().replace(/ /g, '');
        if (email === signUpEmail) {
            console.log('Requested user is verified');
        } else {
            throw new Error('Unauthorized user signup');
        }
    } else {
        console.log('Unauthorized Request');
        throw new Error('Unauthorized Request');
    }
};
