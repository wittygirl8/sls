export const adminNotificationForAcceptTermsAndConditions = (resellerBrandingObj, resellerName) => {
    return `<html>
    <body class="clean-body" style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #ffffff;">
        <div>
            <div style="margin-bottom:20px">This is the notification to let you know that "${resellerName}" has signed the terms and conditions.</div>
            <p>
            <a 
                style="
                    font-size: 16px;
                    line-height: 1.2;
                    word-break: break-word;
                    margin: 0;
                "
                href=${resellerBrandingObj.portalURL}
            >
            ${resellerBrandingObj.portalURL}</a></p>
        </div>
        <div>
        Regards, <br/>
        ${resellerBrandingObj.resellerName} Team.<br/> 
        </div>
    </body>
</html>`;
};
