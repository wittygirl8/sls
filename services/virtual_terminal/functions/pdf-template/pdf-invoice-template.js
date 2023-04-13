import moment from 'moment';
// import Axios from 'axios';

export const invoicePdfTemplate = async (paymentLink, customerInfo, merchantInfo, doc) => {
    const {
        email,
        phone,
        firstName,
        lastName,
        quantity,
        dateOfExpiry,
        item,
        amount,
        description,
        currencySymbol,
        // logoUrl,
        invoiceId,
        supplyDate
    } = customerInfo;
    const { name, OwnersDetail } = merchantInfo;
    const { OwnerAddress, email: merchantEmail, contactPhone: merchantPhone } = OwnersDetail;
    const { addressLine1, addressLine2, city, country, postCode } = OwnerAddress;
    // const axios = Axios.create();
    // const imgResponse = await axios.get(logoUrl,  { responseType: 'arraybuffer' })

    const { width, height } = doc.internal.pageSize;
    const pageMargin = 40;
    const halfPageWidth = width / 2 - pageMargin;
    const fullWidth = width - 2 * pageMargin;
    doc.setFontSize(16);
    doc.text(pageMargin + 0, pageMargin + 0, `${name}`, {
        maxWidth: halfPageWidth + 40
    });
    doc.setFontSize(12);
    doc.setTextColor(105, 107, 106);
    doc.text(pageMargin, pageMargin + 30, `INVOICE  #${invoiceId}`, {
        maxWidth: halfPageWidth + 40
    });
    doc.text(pageMargin, pageMargin + 43, `INVOICE DATE ${moment().format('DD MMM YYYY')}`, {
        maxWidth: halfPageWidth + 40
    });
    if (merchantEmail) {
        doc.text(pageMargin, pageMargin + 55, `${merchantEmail}`, {
            maxWidth: halfPageWidth + 40
        });
    }
    if (merchantPhone) {
        doc.text(pageMargin, pageMargin + 70, `${merchantPhone}`, {
            maxWidth: halfPageWidth + 40
        });
    }
    doc.text(pageMargin, pageMargin + 85, `${addressLine1}, ${addressLine2}, ${city} ${country} ${postCode}`, {
        maxWidth: halfPageWidth + 80
    });
    //logo in funture might need
    // doc.addImage(imgResponse.data, 'PNG', halfPageWidth + 120, pageMargin, 80, 40);
    // logo end

    doc.setFillColor(242, 242, 242);
    doc.rect(0, height * 0.35, width, height, 'F');

    // incoice payment
    const invoiceStartpoint = height * 0.25;
    doc.setFillColor(235, 243, 252);
    doc.roundedRect(pageMargin, invoiceStartpoint, fullWidth, height * 0.25, 10, 10, 'F');
    const invoicePayStartpoint = invoiceStartpoint + 20;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(pageMargin + 15, invoicePayStartpoint, halfPageWidth - 40, height * 0.2, 15, 15, 'F');
    doc.setFontSize(14);
    doc.text(pageMargin + 55, invoicePayStartpoint + 30, 'Amount Due');
    doc.setFontSize(18);
    doc.text(pageMargin + 80, invoicePayStartpoint + 50, `${currencySymbol} ${amount}`, 'center');
    doc.setFontSize(14);
    doc.setTextColor(166, 36, 36);
    doc.text(pageMargin + 55, invoicePayStartpoint + 70, `${moment(dateOfExpiry).format('DD MMM YYYY')}`);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(pageMargin + 15, invoicePayStartpoint + 80, halfPageWidth - 40, height * 0.07, 15, 15, 'F');
    doc.setFillColor(0, 0, 0);
    doc.roundedRect(pageMargin + 35, invoicePayStartpoint + 90, halfPageWidth - 80, height * 0.04, 5, 5, 'F');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.textWithLink('Pay Invoice', pageMargin + 60, invoicePayStartpoint + 105, { url: `${paymentLink}` });
    doc.setTextColor(105, 107, 106);
    doc.setFontSize(13);
    doc.text(pageMargin + halfPageWidth, invoiceStartpoint + 55, `Billed to ${firstName} ${lastName}`, {
        maxWidth: halfPageWidth
    });
    if (email)
        doc.text(pageMargin + halfPageWidth, invoiceStartpoint + 65, `${email}`, {
            maxWidth: halfPageWidth - 20
        });
    if (phone) doc.text(pageMargin + halfPageWidth, invoiceStartpoint + 80, `${phone}`);
    if (description) {
        doc.setFontSize(10);
        doc.text(pageMargin + halfPageWidth, invoiceStartpoint + 80, `${description}`, {
            maxWidth: halfPageWidth - 20
        });
    }
    // invoice information
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    const invoiceInfoStartPoint = height * 0.55;
    doc.text(pageMargin, invoiceInfoStartPoint, 'Description');
    doc.text(pageMargin + halfPageWidth - 30, invoiceInfoStartPoint, 'Supply Date');
    doc.text(pageMargin + halfPageWidth + 65, invoiceInfoStartPoint, 'QTY', 'center');
    doc.text(pageMargin + halfPageWidth + 110, invoiceInfoStartPoint, 'PRICE', 'center');
    doc.text(pageMargin + halfPageWidth + 175, invoiceInfoStartPoint, 'Total', 'center');
    doc.setDrawColor(144, 144, 144);
    doc.line(pageMargin, invoiceInfoStartPoint + 10, fullWidth + 40, invoiceInfoStartPoint + 10);
    doc.setTextColor(105, 107, 106);
    doc.setFontSize(10);
    doc.text(pageMargin, invoiceInfoStartPoint + 30, `${item}`, {
        maxWidth: halfPageWidth - 45
    });
    doc.text(
        pageMargin + halfPageWidth - 30,
        invoiceInfoStartPoint + 30,
        `${moment(supplyDate).format('DD MMM YYYY')}`
    );
    doc.text(pageMargin + halfPageWidth + 65, invoiceInfoStartPoint + 30, `${quantity}`, 'center');
    doc.text(pageMargin + halfPageWidth + 110, invoiceInfoStartPoint + 30, `${currencySymbol} ${amount}`, 'center');
    doc.text(pageMargin + halfPageWidth + 175, invoiceInfoStartPoint + 30, `${currencySymbol} ${amount}`, 'center');
    doc.setDrawColor(144, 144, 144);
    doc.line(pageMargin, invoiceInfoStartPoint + 110, fullWidth + 40, invoiceInfoStartPoint + 110);

    doc.setTextColor(0, 0, 0);
    doc.text(pageMargin + halfPageWidth + 40, invoiceInfoStartPoint + 130, 'Amount Due');
    doc.text(pageMargin + halfPageWidth + 140, invoiceInfoStartPoint + 130, `${currencySymbol} ${amount}`);
    // Footer
    const footerStartPoint = height * 0.9;
    doc.setDrawColor(144, 144, 144);
    doc.line(pageMargin, footerStartPoint, fullWidth + 40, footerStartPoint);
    return doc.output('arraybuffer');
};
