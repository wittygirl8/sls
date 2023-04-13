export const invoiceEmailTemplate = (invoiceinfo, merchantInfo) => {
    const { amount, description, currencySymbol, invoiceId, dateOfExpiry } = invoiceinfo;
    const { name, OwnersDetail } = merchantInfo;
    const { OwnerAddress } = OwnersDetail;
    const { addressLine1, addressLine2, city, country, postCode } = OwnerAddress;
    return `<html>
    <body class="clean-body" style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #ffffff;">
        <style type="text/css">
            .text-color {
                color: black !important;
            }
            .text-align-left {
                text-align: left;
            }
            .heading {
                font-weight: bold;
                font-size: 27px;
                color: #b2afaf !important;
            }
            .merchantBox {
                color: black;
            }
            .merchantName {
                color: black;
                margin-bottom: 0;
                margin-top: 25px;
                margin-bottom: 5px;
                font-weight: 400;
                font-size: 22px;
            }
            .merchantAddress {
                color: black;
                margin-bottom: 0;
                margin-top: 0px;
                margin-bottom: 0px;
                font-weight: 400;
                font-size: 12px;
            }
            .invoiceBox {
                color: black;
                margin: 60px auto;
                
                text-align: left;
            }
            td,
            th {
                text-align: center;
                padding: 8px;
            }
            th {
                font-weight: 500;
                font-size: 15px;
                color: #b2afaf;
            }
            .amountBox {
            	margin-top: 65px;
            }
            .mw-200 {
            	max-width: 200px;
            }
         
        </style>
        <div class="invoiceBox">
            <h1 class="heading text-color">INVOICE</h1>
            <div class="merchantBox text-color">
                <p class="merchantName text-color">${name}</p>
                <p class="merchantAddress text-color">${addressLine1}</p>
                <p class="merchantAddress text-color">${addressLine2}</p>
                <p class="merchantAddress text-color">${city} ${country} ${postCode}</p>

            </div>
            <div class="amountBox">
                <div>
                    <table>
                        <tr>
                            <th>Invoice Ref ${' '}</th>
                           	<th colspan="2" >Description ${' '}</th>
                            <th>Amount${' '}</th>
                            <th>Date of Expiry</th>
                            
                        </tr>
                        <tr>
                            <td># ${invoiceId}</td>
                            <td colspan="2" class="mw-200" style="max-width: 400px !important;text-align: left;">${description}</td>
                            <td> ${currencySymbol} ${amount}</td>
                            <td> ${dateOfExpiry}</td>
                        </tr>
                    </table>
                </div>
                <hr />
                
            </div>
    </body>
    </html>`;
};
