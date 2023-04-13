'use strict';
const { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
const crypto = require('crypto');

export const postDnaCallBackUrl = async (event) => {
    try {
        const payload = event.body;
        if (payload) {
            const hashMapSignature = crypto
                .createHmac('sha256', '=7aGwhVJjtlZdmg6_wQOolaEe612wWxtA_qNQ*cnP8a4NedJNgxG--BxIDw0Urj4')
                .update(payload)
                .digest('base64');

            const headerSignature = event.headers['X-DNAPayments-Signature'];
            const isDnaSignature = hashMapSignature === headerSignature;
            return response({
                message: 'Dna call back url hitted a merchant',
                payload: JSON.parse(payload),
                isDnaSignature: isDnaSignature
            });
        } else {
            return response({
                message: 'No Payload found'
            });
        }
    } catch (error) {
        console.error('Dna response error', error);
        return response(error, 500);
    }
};
