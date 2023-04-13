export const acceptTermsAndConditionsCanonicalResellerNotification = (resellerBrandingObj, resellerName) => {
    return `<html>
    <body class="clean-body" style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #ffffff;">
        <div>
            <p>Dear ${resellerName}, </p>
            <p>Thank you for signing the terms and conditions. Please find the document attached for your records.</p>
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
        <div style="color: #51545e;">
        Regards, <br/>
        ${resellerBrandingObj.resellerName} Team.<br/> 
        </div>
    </body>
</html>`;
};
