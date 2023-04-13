export const getSMSOrderReceiptTemplate = (params) => {
    //Retrieve values from params
    let { resellerBrandingObj } = params;
    return `
        <a> This is a sample email template, replace it.
        You can put reseller name as ${resellerBrandingObj.resellerName}
        In case there is anything which can't be replaced in CP side,
        replace it in Gateway side, prefer to send the data from frotend
        put it as ###VALUE_TO_REPLACE_FOR_ORDER_DESCRIPTION### then do .replace() on the string
        </a>
    `;
};
