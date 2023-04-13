export const addExistingUserAsCanonicalResellerMemberTemplate = (resellerBrandingObj, params) => {
    let { resellerContactUsPage, resellerName, portalURL } = resellerBrandingObj;
    let { canonicalResellerOwnerEmail, isAgent } = params;

    const supportMessage = !isAgent
        ? ` <span >You can find answers to most questions, or contact us at
            <a
                href="${resellerContactUsPage}"
                style="text-decoration: underline; color: #0068a5;"
                target="_blank"
                >${resellerContactUsPage}</a
            >. We're here to help every of the way.<span>`
        : ``;

    return `<table
    cellpadding="0"
    cellspacing="0"
    class="nl-container"
    style="
        table-layout: fixed;
        vertical-align: top;
        min-width: 320px;
        margin: 0 auto;
        border-spacing: 0;
        border-collapse: collapse;
        background-color: #ffffff;
        width: 100%;
    "
    width="100%"
>
    <tbody>
        <tr style="vertical-align: top;" valign="top">
            <td style="word-break: break-word; vertical-align: top;" valign="top">
                <div style="background-color: transparent;">
                    <div
                        class="block-grid"
                        style="
                            margin: 0 auto;

                            overflow-wrap: break-word;
                            word-wrap: break-word;
                            word-break: break-word;
                            background-color: #f6f7fa;
                        "
                    >
                        <div style="border-collapse: collapse; display: table; width: 100%; background-color: #f6f7fa;">
                            <div
                                class="col num12"
                                style="
                                    min-width: 320px;
                                    max-width: 500px;
                                    display: table-cell;
                                    vertical-align: top;
                                    width: 500px;
                                "
                            >
                                <div style="width: 100% !important;">
                                    <div
                                        style="
                                            border: 0px solid transparent;
                                            padding-top: 5px;
                                            padding-bottom: 5px;
                                            padding-right: 0px;
                                            padding-left: 0px;
                                        "
                                    >
                                        <div
                                            style="
                                                color: #555555;
                                                font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
                                                line-height: 1.2;
                                                padding-top: 10px;
                                                padding-right: 50px;
                                                padding-bottom: 10px;
                                                padding-left: 50px;
                                            "
                                        >
                                            <div
                                                style="
                                                    line-height: 1.2;
                                                    font-size: 12px;
                                                    color: #555555;
                                                    font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
                                                "
                                            >
                                                <p
                                                    style="
                                                        font-size: 16px;
                                                        line-height: 1.2;
                                                        word-break: break-word;
                                                        text-align: left;
                                                        margin-left: 20px;
                                                        color: #43425d;
                                                    "
                                                >
                                                    You've been invited to join ${portalURL} Team on owned by ${canonicalResellerOwnerEmail}.
                                                </p>
                                            </div>
                                        </div>
                                        <a href="${portalURL}">
                                            <div style="padding: 10px; text-align: center;">
                                                <div
                                                    style="
                                                        text-decoration: none;
                                                        display: inline-block;
                                                        color: #ffffff;
                                                        background-color: #43425d;
                                                        border-radius: 14px;
                                                        -webkit-border-radius: 14px;
                                                        -moz-border-radius: 14px;
                                                        width: auto;
                                                        width: auto;
                                                        border: 1px solid #43425d;
                                                        padding-top: 5px;
                                                        padding-bottom: 5px;
                                                        font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
                                                        text-align: center;
                                                        word-break: keep-all;
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
                                                            >Access ${resellerName} Portal</span
                                                        ></span
                                                    >
                                                </div>
                                            </div>
                                        </a>
                                        <div
                                            style="
                                                color: #555555;
                                                font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
                                                line-height: 1.2;
                                                padding-top: 10px;
                                                padding-right: 50px;
                                                padding-bottom: 10px;
                                                padding-left: 50px;
                                            "
                                        >
                                            <div
                                                style="
                                                    line-height: 1.2;
                                                    font-size: 12px;
                                                    color: #555555;
                                                    font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
                                                "
                                            >
                                                <p
                                                    style="
                                                        font-size: 16px;
                                                        line-height: 1.2;
                                                        word-break: break-word;
                                                        text-align: left;
                                                        margin-left: 20px;
                                                        color: #43425d;
                                                    "
                                                >
                                                    Joining will give you access to the ${resellerName} Team's portal
                                                    including information on payments, payouts, customers, products and
                                                    more.<br /><br />
                                                    You can find answers to most questions, or contact us at
                                                    ${supportMessage}
                                                </p>
                                                <p
                                                    style="
                                                        font-size: 16px;
                                                        line-height: 1.2;
                                                        word-break: break-word;
                                                        margin: 0;
                                                    "
                                                ></p>
                                                <p
                                                    style="
                                                        font-size: 16px;
                                                        line-height: 1.2;
                                                        word-break: break-word;
                                                        text-align: left;
                                                        margin-left: 20px;
                                                        color: #43425d;
                                                    "
                                                >
                                                    The ${resellerName} team.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    </tbody>
</table>`;
};
