import Axios from 'axios';
const FOOD_HUB_WEB_HOOK_URL = process.env.FOOD_HUB_WEB_HOOK_URL;
const FOOD_HUB_WEB_HOOK_API_KEY = process.env.FOOD_HUB_WEB_HOOK_API_KEY;

export const foodHubWebHook = async (payLoad) => {
    try {
        const axios = Axios.create();

        const fhWebHookConfig = {
            method: 'post',
            url: FOOD_HUB_WEB_HOOK_URL,
            data: payLoad,
            headers: {
                token: FOOD_HUB_WEB_HOOK_API_KEY,
                'Content-Type': 'application/json'
            }
        };

        const response = await axios(fhWebHookConfig);
        console.log('FoodHub Response', response.data);
    } catch (error) {
        const err = error?.response?.data || error;
        console.log('error in foodhub webhook', err);
    }
};
