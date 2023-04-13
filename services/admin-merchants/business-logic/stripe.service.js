import Axios from 'axios';
var qs = require('qs');

const stripeCredentials = JSON.parse(process.env.STRIPE_CREDENTIALS);
const { stripeAccountMap } = require('../helper/stripeAccountMap');
export class StripeService {
    async createStripeAccount(email, legalName, country) {
        try {
            const axios = Axios.create();
            const stripeAccountType = 'datman'; //all new stripe accounts would be created using datman key
            var data = qs.stringify({
                type: 'custom',
                country: country,
                email: email,
                'capabilities[card_payments][requested]': 'true',
                'capabilities[transfers][requested]': 'true',
                'business_profile[name]': legalName
            });

            var config = {
                method: 'post',
                url: 'https://api.stripe.com/v1/accounts',
                headers: {
                    Authorization: `Bearer ${stripeCredentials[stripeAccountType].sk}`
                },
                data: data
            };

            const stripeAccount = await axios(config);

            return stripeAccount.data.id;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    async acceptTermsAndConditions(stripeId, merchant) {
        try {
            const axios = Axios.create();

            const stripeAccountType = stripeAccountMap[merchant.stripeAccountType];
            const data = qs.stringify({
                'tos_acceptance[date]': Math.floor(new Date().getTime() / 1000),
                'tos_acceptance[ip]': '8.8.8.8'
            });

            var config = {
                method: 'post',
                url: `https://api.stripe.com/v1/accounts/${stripeId}`,
                headers: {
                    Authorization: `Bearer ${stripeCredentials[stripeAccountType].sk}`
                },
                data: data
            };

            const acceptTermsAndConditions = await axios(config);
            return acceptTermsAndConditions;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    async getStripeAccount(stripeId) {
        try {
            const axios = Axios.create();

            const datmanStripeAccountType = 'datman';
            let datmanError;
            let datmanStripeAccount;

            try {
                const config1 = {
                    method: 'get',
                    url: `https://api.stripe.com/v1/accounts/${stripeId}`,
                    headers: {
                        Authorization: `Bearer ${stripeCredentials[datmanStripeAccountType].sk}`
                    }
                };

                datmanStripeAccount = await axios(config1);
            } catch (error) {
                datmanError = error.response.data;
            }

            const eatappyStripeAccountType = 'eatappy';
            let eatappyError;

            try {
                const config2 = {
                    method: 'get',
                    url: `https://api.stripe.com/v1/accounts/${stripeId}`,
                    headers: {
                        Authorization: `Bearer ${stripeCredentials[eatappyStripeAccountType].sk}`
                    }
                };

                await axios(config2);
            } catch (error) {
                eatappyError = error.response.data;
            }

            let response;
            if (datmanError && eatappyError) {
                response = { errorMessage: 'This account does not exist' };
            } else {
                response = datmanStripeAccount ? { stripeAccountType: 'DATMAN' } : { stripeAccountType: 'EAT-APPY' };
            }

            return response;
        } catch (err) {
            console.log(err);
            return null;
        }
    }
}
