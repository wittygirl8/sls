import { getCountryCurrencySymbol } from '../helpers/getCountryCurrencySymbol';
export const enableAutoWithdrawalByAccountVerificationEmailTemplate = (
    resellerBrandingObj,
    merchantName,
    merchantCountry
) => {
    return `<html>
<body class="clean-body" style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #ffffff;">
    <div>
        <p>Dear ${merchantName},</p>
        <div style="color: #51545e; margin-bottom: 20px">
            <p>Your account verification is complete and Automatic withdrawals has been enabled.</p>
            <p>Our system will automatically withdraw all the funds on your account except for ${getCountryCurrencySymbol(
                merchantCountry
            )}100</p>
            <p>Important Note : Once Auto withdrawals has been enabled, you will not be able to go back to Manual withdrawal</p>
            <p>You can find answers to most questions, or contact us at ${
                resellerBrandingObj.email
            } . We’re here to help every step of the way.</p>
        </div>
    </div>
  
    <div style="color: #51545e;">
        Best Regards, <br/>
        ${resellerBrandingObj.resellerName}<br/> 
    </div>
</body>
</html>`;
};
