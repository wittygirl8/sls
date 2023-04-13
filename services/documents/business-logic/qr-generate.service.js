var { RelationshipRepo, QrCodesRepo, ResellerRepo } = require('../../../libs/repo');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const { QRStatus } = require('../utils/qr-status');
var fs = require('fs');
var Jimp = require('jimp/dist');
const os = require('os');

const moment = require('moment');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);
const { Op } = db.Sequelize;

const { ResellerNameAndId } = require('../utils/reseller-name-and-id');
const AWS = require('aws-sdk');
const s3Client = new AWS.S3({
    signatureVersion: 'v4'
});

const bucket = process.env.CP_DOCS_BUCKET_NAME;
const EXPIRE_TIME_SECONDS = 600; //considering worst case, At 50KBPS speed  , for a 30MB attatchment, give 10mins to upload

const relationshipRepo = new RelationshipRepo(db);
const qrCodesRepo = new QrCodesRepo(db);
const resellerRepo = new ResellerRepo(db);
const tmpDirPath = os.tmpdir();
const QrPaymentLink = process.env.QR_PAYMENT_LINK;

export class QrGenerateService {
    async generateQrCode(event) {
        try {
            const merchantId = event.pathParameters.merchantId;
            const body = JSON.parse(event.body);
            const { resellerId, description, qrName, link, qrCodeExpiryDate, typeOfQr } = body;
            const amount = body.amount ? body.amount * 100 : 0;
            const qrUUID = uuidv4();
            const status = QRStatus.ACTIVE;

            await this.setResellerLogo(resellerId);
            let dataForQRcode;

            if (typeOfQr === 'payment') {
                dataForQRcode = `${QrPaymentLink}/v3/${qrUUID}`;
            } else {
                dataForQRcode = link;
            }
            await this.saveQrCode(
                qrUUID,
                description,
                qrName,
                amount,
                typeOfQr,
                status,
                merchantId,
                dataForQRcode,
                qrCodeExpiryDate
            );

            const data = await qrCodesRepo.findAll({
                where: { merchantId: merchantId },
                attributes: [
                    'id',
                    'description',
                    'qrName',
                    'amount',
                    'link',
                    'typeOfQr',
                    'status',
                    'qrImgLink',
                    'qrCodeExpiryDate',
                    'created_at'
                ],
                order: [['created_at', 'DESC']]
            });

            fs.rmdirSync(`${tmpDirPath}/qr_code_doc`, { recursive: true });
            fs.rmdirSync(`${tmpDirPath}/reseller_logo`, { recursive: true });
            return {
                operationStatus: true,
                data: {
                    success: 'Successfully generated QR code',
                    qrCodes: [...data]
                }
            };
        } catch (error) {
            console.log('qr code generation error', error);
            return error;
        }
    }

    async setResellerLogo(resellerId) {
        try {
            const reseller = await resellerRepo.findAll({
                where: { id: resellerId },
                attributes: ['id', 'logo', 'name']
            });
            for (let i = 0; i < reseller.length; i++) {
                const { logo, id } = reseller[i];
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
                await this.setResellerLogoForQrCode(
                    logo,
                    resellerId,
                    logoWidth,
                    logoHeight,
                    qrCodeLogoWidth,
                    qrCodeLogoHeight
                );
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

    async saveQrCode(
        qrUUID,
        description,
        qrName,
        amount,
        typeOfQr,
        status,
        merchantId,
        dataForQRcode,
        qrCodeExpiryDate
    ) {
        let transaction;
        let templateType = 'standard';
        const pngFileName = 'qr-code.png';

        try {
            transaction = await db.sequelize.transaction();

            const qrCodeUrl = await this.createAndUploadQrCode(
                qrUUID,
                dataForQRcode,
                merchantId,
                templateType,
                typeOfQr,
                description
            );

            if (qrCodeUrl) {
                const qrCodeDto = {
                    merchantId: merchantId,
                    description: description,
                    qrName: qrName,
                    qrUUID: qrUUID,
                    amount: amount,
                    typeOfQr: typeOfQr,
                    status: status,
                    link: dataForQRcode,
                    qrImgLink: qrCodeUrl,
                    qrCodeExpiryDate: qrCodeExpiryDate
                };
                await qrCodesRepo.save(qrCodeDto, transaction);
            }
            await transaction.commit();
            return null;
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            //Remove S3 object
            const s3PngParams = {
                Bucket: bucket,
                Key: `qr-codes/${templateType}/${pngFileName}`
            };

            await s3Client.deleteObject(s3PngParams).promise();

            throw error;
        }
    }
    async preSignedUrlGet(typeOfQr) {
        const s3Params = {
            Bucket: bucket,
            Key:
                typeOfQr === 'payment'
                    ? 'qr-code-background-img/payment_background.png'
                    : 'qr-code-background-img/generic_background.png',
            Expires: EXPIRE_TIME_SECONDS
        };

        const presignedUrl = await s3Client.getSignedUrlPromise('getObject', s3Params);
        return presignedUrl;
    }

    async createAndUploadQrCode(qrUUID, dataForQRcode, merchantId, templateType, typeOfQr, description) {
        const relationsShip = await relationshipRepo.findOne({
            where: { merchantId: merchantId }
        });

        if (relationsShip) {
            const resellerId = relationsShip.resellerId;

            const backGroundWidth = 1100;
            const backGroundHight = 1900;
            const width = 600;
            const height = 700;
            let qrCodeLogoWidth = 370;
            if (resellerId === ResellerNameAndId.OMNIPAY) {
                qrCodeLogoWidth = 525;
            }
            await this.createQrCode(
                typeOfQr,
                description,
                dataForQRcode,
                merchantId,
                qrCodeLogoWidth,
                resellerId,
                backGroundWidth,
                backGroundHight,
                width,
                height
            );

            const file1 = await fs.readFileSync(
                `${tmpDirPath}/third_party_qr_code_doc/third_party_qr_${merchantId}.png`
            );
            const qrCodeDto = {
                pngFile: file1,
                pngFileName: 'qr-code.png',
                pngFileType: 'image/png'
            };
            const qrCodeUrl = await this.uploadQrCodeToAWS(qrUUID, templateType, qrCodeDto, merchantId);

            fs.unlinkSync(`${tmpDirPath}/third_party_qr_code_doc/third_party_qr_${merchantId}.png`);
            fs.unlinkSync(`${tmpDirPath}/third_party_qr_code_doc/third_party_qr_code_only_${merchantId}.png`);

            return qrCodeUrl;
        } else {
            console.log(`Relationship not found for merchantId ${merchantId}`);
            return null;
        }
    }

    async createQrCode(
        typeOfQr,
        description,
        dataForQRcode,
        merchantId,
        qrCodeLogoWidth,
        resellerId,
        backGroundWidth,
        backGroundHight,
        width,
        height
    ) {
        if (!fs.existsSync(`${tmpDirPath}/third_party_qr_code_doc`)) {
            fs.mkdirSync(`${tmpDirPath}/third_party_qr_code_doc`);
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
        const route = Jimp.FONT_SANS_32_BLACK;
        const font = await Jimp.loadFont(route);
        // adding qr code to background image
        await QRCode.toFile(
            `${tmpDirPath}/third_party_qr_code_doc/third_party_qr_code_only_${merchantId}.png`,
            dataForQRcode,
            opts
        );
        let qrCodeImage = await Jimp.read(
            `${tmpDirPath}/third_party_qr_code_doc/third_party_qr_code_only_${merchantId}.png`
        );
        const backGroundImage = await Jimp.read(await this.preSignedUrlGet(typeOfQr));
        backGroundImage.resize(backGroundWidth, backGroundHight);

        const qrCodePosX = (backGroundWidth - width) / 2;
        const qrCodePosY = 800;
        backGroundImage.composite(qrCodeImage, qrCodePosX, qrCodePosY);
        if (description) {
            const maxWidth = 800;
            backGroundImage.print(
                font,
                (backGroundWidth - maxWidth) / 2,
                1500,
                {
                    text: description,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
                },
                maxWidth
            );
        }
        backGroundImage.quality(100);

        await backGroundImage.writeAsync(`${tmpDirPath}/third_party_qr_code_doc/third_party_qr_${merchantId}.png`);
    }

    async uploadQrCodeToAWS(qrUUID, templateType, qrCodeDto) {
        const { pngFile, pngFileName, pngFileType } = qrCodeDto;

        const s3PngParams = {
            Bucket: bucket,
            Key: `qr-codes/${qrUUID.toString()}/${templateType}/${pngFileName}`,
            Expires: EXPIRE_TIME_SECONDS,
            ContentType: pngFileType,
            ACL: 'public-read',
            Body: pngFile
        };

        let qrCodeUrl;

        try {
            const uploadedFile = await s3Client.upload(s3PngParams).promise();
            qrCodeUrl = uploadedFile.Location;
        } catch (err) {
            console.log(err);
        }

        return qrCodeUrl;
    }

    async fetchQrCodes(merchantId, searchValue, offset, statusFilter, limit) {
        let transaction;
        try {
            transaction = await db.sequelize.transaction();
            const currentDay = moment().utc().format('YYYY-MM-DD HH:mm:ss');
            const expiredQrCodes = await qrCodesRepo.findAll({
                where: {
                    qrCodeExpiryDate: { [Op.lt]: currentDay },
                    merchantId: merchantId,
                    status: 'Active'
                },
                attributes: ['id', 'merchantId', 'status', 'qrCodeExpiryDate']
            });
            const expiryQrCodeIds = expiredQrCodes.map((qrCode) => qrCode.id);
            await qrCodesRepo.updateAll(
                {
                    id: { [Op.in]: expiryQrCodeIds }
                },
                { status: 'Expired' },
                transaction
            );
            await transaction.commit();
            let searchQuery = { merchantId: merchantId };
            if (searchValue.length > 2) {
                searchValue = '%' + searchValue + '%';

                searchQuery = {
                    ...searchQuery,
                    id: { [Op.like]: searchValue }
                };
            }
            if (statusFilter) {
                searchQuery = {
                    ...searchQuery,
                    status: statusFilter
                };
            }

            const qrCodes = await qrCodesRepo.findAll({
                where: searchQuery,
                attributes: [
                    'id',
                    'description',
                    'link',
                    'qrImgLink',
                    'amount',
                    'qrCodeExpiryDate',
                    'qrName',
                    'typeOfQr',
                    'status',
                    'created_at',
                    'updated_at',
                    'reason'
                ],
                order: [['created_at', 'DESC']],
                offset: offset,
                limit: limit
            });
            if (!qrCodes) {
                return null;
            }

            const qrCodeCount = await qrCodesRepo.count({
                where: searchQuery
            });
            return { qrCodes: qrCodes, count: qrCodeCount };
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            console.log(error);
            throw error;
        }
    }

    async closeQrCode(merchantId, id, reason, status) {
        let transaction;
        let templateType = 'standard';
        const pngFileName = 'qr-code.png';

        try {
            transaction = await db.sequelize.transaction();
            let closedQr;
            const mid = await qrCodesRepo.findOne({ where: { merchantId: merchantId } });
            if (!mid) {
                throw new Error('NOT_FOUND');
            } else {
                const qrData = await qrCodesRepo.findOne({ where: { id: id } });

                if (!qrData) {
                    throw new Error('NOT_FOUND');
                }

                closedQr = await qrCodesRepo.update(id, reason, status);

                const s3Params = {
                    Bucket: bucket,
                    Key: `qr-codes/${id}/${templateType}/${pngFileName}`
                };

                await s3Client.deleteObject(s3Params).promise();
                await transaction.commit();
            }
            return closedQr;
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            throw error;
        }
    }
}
