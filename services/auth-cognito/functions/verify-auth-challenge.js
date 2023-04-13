const crypto = require('crypto');
const key = 'CKXLt3gUY9uoF5uvErXFJ6YGDQO2srfL';

export const handler = async (event) => {
    try {
        const loginHash = event.request.privateChallengeParameters.secretLoginCodeHash;
        if (verifyOTP(event.request.userAttributes.email, loginHash, event.request.challengeAnswer)) {
            event.response.answerCorrect = true;
        } else {
            event.response.answerCorrect = false;
        }

        return event;
    } catch (err) {
        console.error(err);
        throw new Error('Internal error');
    }
};

const verifyOTP = (identity, hash, otp) => {
    // Seperate Hash value and expires from the hash returned from the user
    let [hashValue, expires] = hash.split('.');
    // Check if expiry time has passed
    let now = Date.now();
    if (now > parseInt(expires)) return false;
    // Calculate new hash with the same key and the same algorithm
    let data = `${identity}.${otp}.${expires}`;
    let newCalculatedHash = crypto.createHmac('sha256', key).update(data).digest('hex');
    // Match the hashes
    if (newCalculatedHash === hashValue) {
        return true;
    }
    return false;
};
