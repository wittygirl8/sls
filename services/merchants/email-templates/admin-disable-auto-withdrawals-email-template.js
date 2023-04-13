export const adminDisableAutoWithdrawalsEmailTemplate = (resellerBrandingObj, merchantName) => {
    return `<html>
<body class="clean-body" style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #ffffff;">
    <div>
        <p>Dear ${merchantName},</p>
        <div style="color: #51545e; margin-bottom: 20px">
            <p>Your automatic withdrawals have been disabled.</p>   
            <p>If you have any questions, please feel free to contact us on: ${resellerBrandingObj.email}</p>
        </div>
    </div>
  
    <div style="color: #51545e;">
        Best Regards, <br/>
        ${resellerBrandingObj.resellerName}<br/> 
    </div>
</body>
</html>`;
};
