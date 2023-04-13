import Axios from 'axios';
var qs = require('qs');

const STRIPE_SK = process.env.STRIPE_SK; //`sk_test_51H32qlHtexjZAkUsPYY29KBAw5c3ZjhEeU8ibaCOFLgB5ZhZC1kSSjYBpPyZJgl1bviAD8CujCeUMd4OEg3Q5Vcy00BVIdLJYD`;

export class StripeService {
    async createStripeAccount(email, legalName) {
        try {
            const axios = Axios.create();

            var data = qs.stringify({
                type: 'custom',
                //assuming we create stripe for eat appy clients only, as australian accounts
                country: 'AU',
                email: email,
                'capabilities[card_payments][requested]': 'true',
                'capabilities[transfers][requested]': 'true',
                'business_profile[name]': legalName
            });

            var config = {
                method: 'post',
                url: 'https://api.stripe.com/v1/accounts',
                headers: {
                    Authorization: `Bearer ${STRIPE_SK}`
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
}
