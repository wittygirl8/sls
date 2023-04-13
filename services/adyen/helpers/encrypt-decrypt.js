const crypto = require('crypto');

export const decryptPayload = (encryptedData, secret) => {
    try {
        encryptedData = Buffer.from(encryptedData, 'base64').toString('ascii');
        let encryptionMethod = 'AES-256-CBC';
        let iv = secret.substr(0, 16);
        let decryptor = crypto.createDecipheriv(encryptionMethod, secret, iv);
        let decryptData = decryptor.update(encryptedData, 'base64', 'utf8') + decryptor.final('utf8');
        return decryptData;
    } catch (e) {
        throw 'Invalid link';
    }
};

export const encryptPayload = (data, secret) => {
    let encryptionMethod = 'AES-256-CBC';
    let iv = secret.substr(0, 16);
    let encryptor = crypto.createCipheriv(encryptionMethod, Buffer.from(secret), iv);
    let encrypted = encryptor.update(data, 'utf8', 'base64') + encryptor.final('base64');
    return Buffer(encrypted).toString('base64');
};
