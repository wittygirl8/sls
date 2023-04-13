require('number-to-locale-string');

export const getPayByLinkEmailContent = (params) => {
    let { linkForTheUserToPay, merchantName, amount, description, currencySymbol, requestSendAt } = params;

    return `
    <div>
        <p>Please see the payment details below - “Click here to Pay” to complete your payment.</p>
    </div>
    <div style="background-color: #F4F4F7; padding-top:15px; padding-bottom: 20px;text-align: center;">    
        <div style="text-align:center;">
            <p><b>Date:</b> ${requestSendAt}</p>
            <p><b>Merchant:</b> ${merchantName}</p>
            ${description ? `<p><b>Order Description:</b> ${description}</p>` : ''}
        </div>
        <div style="text-align:center;">
            <p style="font-size: 40px;">${currencySymbol} ${Number(amount).toLocaleString('en-GB', {
        minimumFractionDigits: 2
    })}</p>
        </div>
        <a href="${linkForTheUserToPay}" style="display:inline-block;">
            <div class="button-container" style="display: inline-block; text-align: center;">
                <div
                    style="
                        text-decoration: none;
                        display: inline-block;
                        color: #ffffff;
                        /* background-color: #43425d; */
                        background-color: #008001;
                        border-radius: 14px;
                        -webkit-border-radius: 14px;
                        -moz-border-radius: 14px;
                        width: auto;
                        border: 1px solid #43425d;
                        padding-top: 5px;
                        padding-bottom: 5px;
                        font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
                        text-align: center;
                        word-break: keep-all;
                        box-shadow: 5px 5px #425a5d;
                    "
                >
                    <span
                        style="
                            padding-left: 60px;
                            padding-right: 60px;
                            font-size: 16px;
                            display: inline-block;
                            cursor: pointer;
                        "
                        ><span
                            style="
                                font-size: 16px;
                                line-height: 2;
                                word-break: break-word;
                                color: #fff;
                                cursor: pointer;
                            "
                            >Click here to Pay
                        </span></span
                    >
                </div>
            </div>
        </a>
    </div>
    `;
};
