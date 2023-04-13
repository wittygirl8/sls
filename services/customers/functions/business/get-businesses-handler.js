'use strict';

var { response } = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');

// import { BusinessService } from '../../business-logic/business.service';
// const businessService = new BusinessService();

// since this functions are not in a use returning it directly to avoid any security issues
export const getBusinesses = async () => {
    return response('Internal server error', 500);
    // try {
    //     const getBusinessesOperaion = await businessService.getBusinesses();
    //     return response(getBusinessesOperaion.data, 200);
    // } catch (err) {
    //     return response('Internal server error', 500);
    // }
};
