export const approveBankUpdateEmailTemplate = (resellerBrandingObj, merchantName) => {
    return `<html>
    <body class="clean-body" style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #ffffff;">
        <div style="
                font-size:24px; 
                font-weight:bold; 
                text-align:center; 
                color:#2F5496; 
                margin-bottom:20px;">
                
                Bank Update Approved</div>
        <div>
            <p>Dear ${merchantName}, </p>
            <div>
                <p>Your recent Bank account update has been approved.</p>
                <p>All future withdrawals will be sent to the banking details you provided.</p>
            </div>
            <p style="margin-bottom:10px">If you did not initiate this bank update request, we advise you to contact us immediately.</p>
            <p><strong>Need help?</strong></p>
            <p>You can find answers to most questions at our help center ${resellerBrandingObj.helpPageURL} and you will also be able to chat and raise a ticket with us directly. </p>
            
        </div>
        <div style="color: #51545e;">
        Yours, <br/>
        ${resellerBrandingObj.resellerName} Team.<br/> 
        </div>
        <p><a href=mailto:${resellerBrandingObj.email}>${resellerBrandingObj.email}</a></p>
    </body>
</html>`;
};
