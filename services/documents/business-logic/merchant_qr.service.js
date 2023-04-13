var { MerchantRepo, MerchantQrRepo, RelationshipRepo, ResellerRepo } = require('../../../libs/repo');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const QRCode = require('qrcode');
const { PDFDocument } = require('pdf-lib');
var fs = require('fs');
var Jimp = require('jimp/dist');
const os = require('os');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

const { ResellerNameAndId } = require('../utils/reseller-name-and-id');
const AWS = require('aws-sdk');
const s3Client = new AWS.S3({
    signatureVersion: 'v4'
});

const { v4: uuidv4 } = require('uuid');
const bucket = process.env.CP_DOCS_BUCKET_NAME;
const QrPaymentLink = process.env.QR_PAYMENT_LINK;

const EXPIRE_TIME_SECONDS = 600; //considering worst case, At 50KBPS speed  , for a 30MB attatchment, give 10mins to upload

const merchantQrRepo = new MerchantQrRepo(db);
const merchantRepo = new MerchantRepo(db);
const relationshipRepo = new RelationshipRepo(db);
const resellerRepo = new ResellerRepo(db);
const tmpDirPath = os.tmpdir();

export class MerchantQrService {
    async generateQrCodeForMerchant() {
        try {
            const allMerchants = await merchantRepo.findAll({
                where: { isMerchantQrCodeLatest: 0 },
                attributes: ['id', 'merchantQrId'],
                limit: 90
            });

            if (allMerchants.length > 0) {
                await this.setResellerLogo();

                for (let i = 0; i < allMerchants.length; i++) {
                    await this.saveQrCode(allMerchants[i].id, allMerchants[i].merchantQrId);
                }

                fs.rmdirSync(`${tmpDirPath}/qr_code_doc`, { recursive: true });
                fs.rmdirSync(`${tmpDirPath}/reseller_logo`, { recursive: true });
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async setResellerLogo() {
        try {
            const allReseller = await resellerRepo.findAll({
                attributes: ['id', 'logo', 'name']
            });

            for (let i = 0; i < allReseller.length; i++) {
                const { logo, id } = allReseller[i];

                let logoWidth = 750;
                let logoHeight = 500;
                let qrCodeLogoWidth = 370;
                let qrCodeLogoHeight = 320;
                if (id === ResellerNameAndId.OMNIPAY) {
                    logoWidth = 1120;
                    logoHeight = 320;
                    qrCodeLogoWidth = 525;
                    qrCodeLogoHeight = 150;
                }
                await this.setResellerLogoForQrCode(logo, id, logoWidth, logoHeight, qrCodeLogoWidth, qrCodeLogoHeight);
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async setResellerLogoForQrCode(logo, resellerId, logoWidth, logoHeight, qrCodeLogoWidth, qrCodeLogoHeight) {
        if (!fs.existsSync(`${tmpDirPath}/reseller_logo`)) {
            fs.mkdirSync(`${tmpDirPath}/reseller_logo`);
        }

        let logoImage = await Jimp.read(logo);
        logoImage = logoImage.resize(logoWidth, logoHeight);
        logoImage.quality(100);
        logoImage = await logoImage;

        const whiteBackgroundLogo = new Jimp(logoWidth, logoHeight, '#FFFFFF');
        whiteBackgroundLogo.composite(logoImage, 0, 0);
        whiteBackgroundLogo.quality(100);
        whiteBackgroundLogo.resize(qrCodeLogoWidth, qrCodeLogoHeight);
        await whiteBackgroundLogo.writeAsync(`${tmpDirPath}/reseller_logo/reseller_${resellerId}.png`);
    }

    async saveQrCode(merchantId, merchantQrId) {
        let transaction;
        let templateType = 'standard';
        const qrCodeId = merchantQrId ? merchantQrId : uuidv4();
        const pdfFileName = 'qr-code.pdf';
        const pngFileName = 'qr-code.png';

        try {
            transaction = await db.sequelize.transaction();

            const qrCodeUrl = await this.createAndUploadQrCode(merchantId, qrCodeId, templateType);

            if (qrCodeUrl) {
                const qrCodeDto = {
                    id: qrCodeId,
                    merchantId: merchantId,
                    standardDocLink: qrCodeUrl
                };

                if (merchantQrId) {
                    await merchantQrRepo.update(qrCodeId, qrCodeDto, transaction);
                    await merchantRepo.update(merchantId, { isMerchantQrCodeLatest: 1 }, transaction);
                } else {
                    await merchantQrRepo.save(qrCodeDto, transaction);
                    await merchantRepo.update(
                        merchantId,
                        { merchantQrId: qrCodeId, isMerchantQrCodeLatest: 1 },
                        transaction
                    );
                }
            }

            await transaction.commit();
            return null;
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            //Remove S3 object
            const s3PdfParams = {
                Bucket: bucket,
                Key: `merchant-qr-codes/${qrCodeId}/${templateType}/${pdfFileName}`
            };

            const s3PngParams = {
                Bucket: bucket,
                Key: `merchant-qr-codes/${qrCodeId}/${templateType}/${pngFileName}`
            };

            await s3Client.deleteObject(s3PdfParams).promise();
            await s3Client.deleteObject(s3PngParams).promise();

            throw error;
        }
    }

    async createQrCode(
        dataForQRcode,
        width,
        height,
        merchantId,
        qrCodeLogoWidth,
        resellerId,
        backGroundWidth,
        backGroundHight,
        finalWidth,
        finalHeight
    ) {
        if (!fs.existsSync(`${tmpDirPath}/qr_code_doc`)) {
            fs.mkdirSync(`${tmpDirPath}/qr_code_doc`);
        }

        const opts = {
            errorCorrectionLevel: 'H',
            margin: 1,
            color: {
                dark: '#000000',
                light: '#ffffff'
            },
            width: width,
            height: height
        };

        // adding qr code to background image
        await QRCode.toFile(`${tmpDirPath}/qr_code_doc/qr_code_only_${merchantId}.png`, dataForQRcode, opts);
        let qrCodeImage = await Jimp.read(`${tmpDirPath}/qr_code_doc/qr_code_only_${merchantId}.png`);

        const backGroundImage = await Jimp.read(`${__dirname}/../background_qr_code_image/background.png`);
        backGroundImage.resize(backGroundWidth, backGroundHight);

        const qrCodePosX = (backGroundWidth - width) / 2;
        const qrCodePosY = 600;
        backGroundImage.composite(qrCodeImage, qrCodePosX, qrCodePosY);

        //adding logo to background image
        const logo = await Jimp.read(`${tmpDirPath}/reseller_logo/reseller_${resellerId}.png`);

        //const finalQrCodeWithLogo = await Jimp.read(qrCodeImage);
        const xCenter = (backGroundWidth - qrCodeLogoWidth) / 2;
        const yCenter = 1400;
        backGroundImage.composite(logo, xCenter, yCenter);
        backGroundImage.resize(finalWidth, finalHeight);
        backGroundImage.quality(100);

        await backGroundImage.writeAsync(`${tmpDirPath}/qr_code_doc/qr_code_${merchantId}.png`);

        const imageBuffer = await backGroundImage.getBufferAsync(Jimp.MIME_PNG);

        // Create a new PDFDocument
        const pdfDoc = await PDFDocument.create();

        // Embed the JPG image bytes and PNG image bytes
        const pngImage = await pdfDoc.embedPng(imageBuffer);

        // Add a blank page to the document
        const page = pdfDoc.addPage();
        page.setSize(width, width);

        // Draw the PNG image near the lower right corner of the JPG image
        page.drawImage(pngImage);
        // Serialize the PDFDocument to bytes (a Uint8Array)
        const pdfBytes = await pdfDoc.save();

        fs.writeFileSync(`${tmpDirPath}/qr_code_doc/qr_code_${merchantId}.pdf`, pdfBytes);
    }

    async uploadQrCodeToAWS(templateType, qrCodeDto, qrCodeId) {
        const { pdfFile, pngFile, pdfFileName, pdfFileType, pngFileName, pngFileType } = qrCodeDto;

        const s3PdfParams = {
            Bucket: bucket,
            Key: `merchant-qr-codes/${qrCodeId}/${templateType}/${pdfFileName}`,
            Expires: EXPIRE_TIME_SECONDS,
            ContentType: pdfFileType,
            ACL: 'public-read',
            Body: pdfFile
        };

        const s3PngParams = {
            Bucket: bucket,
            Key: `merchant-qr-codes/${qrCodeId}/${templateType}/${pngFileName}`,
            Expires: EXPIRE_TIME_SECONDS,
            ContentType: pngFileType,
            ACL: 'public-read',
            Body: pngFile
        };

        let qrCodeUrl;

        try {
            const uploadedFile = await s3Client.upload(s3PngParams).promise();
            qrCodeUrl = uploadedFile.Location;
            console.log(`Qr code image uploaded successfully at ${uploadedFile.Location}`);
        } catch (err) {
            console.log(err);
        }

        try {
            const uploadedFile = await s3Client.upload(s3PdfParams).promise();
            console.log(`Qr code pdf uploaded successfully at ${uploadedFile.Location}`);
        } catch (err) {
            console.log(err);
        }

        return qrCodeUrl;
    }

    async createAndUploadQrCode(merchantId, qrCodeId, templateType) {
        const relationsShip = await relationshipRepo.findOne({ where: { merchantId: merchantId } });
        if (relationsShip) {
            const resellerId = relationsShip.resellerId;

            const backGroundWidth = 1100;
            const backGroundHight = 1800;
            const finalWidth = 300;
            const finalHeight = 500;
            const width = 700;
            const height = 700;
            let qrCodeLogoWidth = 370;
            if (resellerId === ResellerNameAndId.OMNIPAY) {
                qrCodeLogoWidth = 525;
            }

            const paymentLink = `${QrPaymentLink}/${qrCodeId}`;

            await this.createQrCode(
                paymentLink,
                width,
                height,
                merchantId,
                qrCodeLogoWidth,
                resellerId,
                backGroundWidth,
                backGroundHight,
                finalWidth,
                finalHeight
            );
            const file1 = await fs.readFileSync(`${tmpDirPath}/qr_code_doc/qr_code_${merchantId}.pdf`);
            const file2 = await fs.readFileSync(`${tmpDirPath}/qr_code_doc/qr_code_${merchantId}.png`);

            const qrCodeDto = {
                pdfFile: file1,
                pngFile: file2,
                pdfFileName: 'qr-code.pdf',
                pdfFileType: 'application/pdf',
                pngFileName: 'qr-code.png',
                pngFileType: 'image/png'
            };
            const qrCodeUrl = await this.uploadQrCodeToAWS(templateType, qrCodeDto, qrCodeId, merchantId);

            fs.unlinkSync(`${tmpDirPath}/qr_code_doc/qr_code_${merchantId}.pdf`);
            fs.unlinkSync(`${tmpDirPath}/qr_code_doc/qr_code_${merchantId}.png`);
            fs.unlinkSync(`${tmpDirPath}/qr_code_doc/qr_code_only_${merchantId}.png`);

            return qrCodeUrl;
        } else {
            console.log(`Relationship not found for merchantId ${merchantId}`);
            return null;
        }
    }

    async getQrCode(merchantId) {
        try {
            const merchant = await merchantRepo.findOne({
                where: { id: merchantId },
                attributes: ['merchantQrId']
            });

            const merchantQrCode = await merchantQrRepo.findOne({
                where: { id: merchant.merchantQrId }
            });

            if (!merchantQrCode) {
                return null;
            }

            const qrCodeUrl = merchantQrCode.standardDocLink;
            const paymentUrl = `${QrPaymentLink}/${merchant.merchantQrId}`;

            return { qrCodeUrl: qrCodeUrl, paymentUrl: paymentUrl };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}
