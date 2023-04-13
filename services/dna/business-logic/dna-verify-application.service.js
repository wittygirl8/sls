import Axios from 'axios';
const {
    AcquirerAccountConfigurationRepo,
    DnaMerchantMetadataRepo,
    AcquirersRepo,
    MerchantRepo,
    OwnersDetailsRepo
} = require('../../../libs/repo');
import FormData from 'form-data';
import { getDnaBearerToken } from '../business-logic/dna-onboard-application.service';
import { DNAEventStatus } from '../helpers/dnaEventStatus';
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const moment = require('moment');

var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
var { response, flakeGenerateDecimal } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
const { TermsAndConditionsService } = require('../../documents/business-logic/terms-and-conditions.service');
const { TermsAndConditionEntityMap } = require('../../documents/utils/terms-and-conditions-entity');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

const termsAndConditionsService = new TermsAndConditionsService();
const AWS = require('aws-sdk');
const s3Client = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    signatureVersion: 'v4'
});
const bucket = process.env.CP_DOCS_BUCKET_NAME;
const EXPIRE_TIME_SECONDS = 600;
const acquirerAccountConfigurationRepo = new AcquirerAccountConfigurationRepo(db);
const dnaMerchantMetadataRepo = new DnaMerchantMetadataRepo(db);
const acquirerRepo = new AcquirersRepo(db);
const DNA_API_URL = process.env.DNA_API_URL;
const merchantRepo = new MerchantRepo(db);
const ownersDetailsRepo = new OwnersDetailsRepo(db);
const { DNAOnboardStatus } = require('../helpers/dnaOnboardStatus');
var fs = require('fs');
const os = require('os');
const tmpDirPath = os.tmpdir();

export class DnaVerifyApplicationService {
    async submitMsaDoc(merchantId, docUrl, documentId, dnaApplicationId) {
        try {
            const merchant = await merchantRepo.findOne({
                where: { id: merchantId },
                attributes: ['id', 'primaryOwnerId']
            });
            const agreementDto = {
                fileName: `dna_merchant_agreement_${merchantId}.pdf`,
                fileType: 'application/pdf',
                pdfDocumentId: documentId
            };
            const axios = Axios.create();
            let doc = await axios.get(docUrl, { responseType: 'arraybuffer' });
            const existingPdfBytes = Buffer.from(doc.data);
            const ownerDetails = await ownersDetailsRepo.findOne({ where: { id: merchant.primaryOwnerId } });
            const awsPresignedUrl = await msaPreSignedUrlPut(merchantId, agreementDto);
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const pages = pdfDoc.getPages();
            const thirdPage = pages[2];
            const { height } = thirdPage.getSize();
            const currentDate = moment(new Date()).format('DD-MM-YYYY');
            thirdPage.drawText(ownerDetails.fullName, {
                x: 200,
                y: height / 2 + 200,
                size: 15,
                font: helveticaFont,
                color: rgb(0, 0, 0)
            });
            thirdPage.drawText(currentDate.toString(), {
                x: 200,
                y: height / 2 + 157,
                size: 8,
                font: helveticaFont,
                color: rgb(0, 0, 0)
            });
            const pdfBytes = await pdfDoc.save();

            let s3config = {
                method: 'put',
                url: awsPresignedUrl.presignedUrl,
                data: pdfBytes,
                headers: {
                    'Content-type': 'application/pdf'
                }
            };
            await axios(s3config);
            const querySeparator = awsPresignedUrl.presignedUrl.lastIndexOf('?Content-Type');
            const docLink = awsPresignedUrl.presignedUrl.substring(0, querySeparator);
            const documentData = await axios(docLink, { responseType: 'arraybuffer' });
            const existingPdfImageBuffer = Buffer.from(documentData.data, 'binary');
            const authtoken = await getDnaBearerToken('partners_onboarding');
            const agreementResponse = await submitDnaAgreement(
                existingPdfImageBuffer,
                dnaApplicationId,
                authtoken,
                ownerDetails,
                currentDate,
                agreementDto.fileName
            );
            return agreementResponse;
        } catch (e) {
            console.log(e);
        }
    }

    async updateApplicationStatus(merchantId, payload) {
        try {
            if (payload) {
                const parsedData = JSON.parse(payload);
                const transaction = await db.sequelize.transaction();
                const { applicationId, event, message, additionalInfo } = parsedData;
                let formattedAdditionalInfo = {};
                let dnaUpdateDto;
                let dnaMetaData;
                dnaUpdateDto = {
                    dnaApplicationId: applicationId,
                    applicationStatus: event,
                    acquirer: 'DNA',
                    merchantId: parseInt(merchantId)
                };
                if (message === 'Success' || event === DNAEventStatus.ECOM_ISSUED) {
                    if (!additionalInfo) {
                        return null;
                    }
                    for (let i = 0; i < additionalInfo.length; i++) {
                        formattedAdditionalInfo[additionalInfo[i].key] = additionalInfo[i].value;
                    }
                    dnaUpdateDto['applicationReason'] = 'Successfully Recieved DNA Terminal ID';
                    dnaUpdateDto['applicationStatus'] = event;
                    dnaUpdateDto['status'] = 'ACTIVE';
                    dnaUpdateDto['dnaMid'] = formattedAdditionalInfo.merchantId;
                    dnaMetaData = {
                        merchantId: merchantId,
                        terminalId: formattedAdditionalInfo.terminalId,
                        rawData: JSON.stringify(formattedAdditionalInfo)
                    };
                    const dnaMerchant = await dnaMerchantMetadataRepo.findOne({
                        where: { merchantId: merchantId }
                    });
                    if (!dnaMerchant) {
                        await dnaMerchantMetadataRepo.save(dnaMetaData);
                    } else {
                        dnaMerchant.update(dnaMetaData);
                    }
                } else if (event === DNAEventStatus.MSA) {
                    dnaUpdateDto['applicationStatus'] = event;
                    const authtoken = await getDnaBearerToken('partners_onboarding');
                    const dnaAgreement = await getDnaAgreement(merchantId, authtoken);
                    if (dnaAgreement.status === 200) {
                        await downloadDnaAgreement(merchantId, dnaAgreement.data);
                    }
                } else {
                    if (event === DNAEventStatus.NEED_ADDITIONAL_INFO && !additionalInfo) {
                        return null;
                    }
                    for (let j = 0; j < additionalInfo?.length; j++) {
                        formattedAdditionalInfo[additionalInfo[j].key] = additionalInfo[j].value;
                    }
                    const additionalInfoData = JSON.stringify(formattedAdditionalInfo);
                    dnaUpdateDto['applicationReason'] = additionalInfoData;
                }
                const dnaAccountDto = {
                    merchantId: merchantId,
                    dnaApplicationId: applicationId,
                    applicationStatus: event,
                    acquirer: 'DNA',
                    gateway: 'DNA',
                    productType: 'A920'
                };
                const dnaMerchant = await acquirerAccountConfigurationRepo.findOne({
                    where: { merchantId: merchantId, acquirer: 'DNA' }
                });
                if (dnaMerchant) {
                    await acquirerAccountConfigurationRepo.update(dnaUpdateDto, transaction);
                } else {
                    await acquirerAccountConfigurationRepo.save(dnaAccountDto, transaction);
                    await merchantRepo.update(
                        merchantId,
                        {
                            onBoardRequest: DNAOnboardStatus.ONBOARDING_INITIAED
                        },
                        transaction
                    );
                }
                await transaction.commit();
                return { message: 'Success', status: 200 };
            }
        } catch (error) {
            console.error(error);
            return response({}, 500);
        }
    }
}

export const getDnaAgreement = async (merchantId, authtoken) => {
    try {
        const dnaApplicationId = await acquirerAccountConfigurationRepo.findOne({
            where: {
                merchantId: merchantId,
                acquirer: 'DNA'
            },
            attributes: ['dnaApplicationId']
        });
        const axios = Axios.create();
        let config = {
            method: 'get',
            url: `${DNA_API_URL}/${dnaApplicationId.dnaApplicationId}/msa`,
            headers: {
                Authorization: `Bearer ${authtoken}`,
                'Content-Type': 'application/json',
                accept: 'application/pdf'
            },
            responseType: 'arraybuffer'
        };
        const dnaApplicationResponse = await axios(config);
        if (dnaApplicationResponse) {
            return { data: dnaApplicationResponse.data, status: dnaApplicationResponse.status };
        }
    } catch (error) {
        console.log('error in Agreement Download', error);
        return { message: 'MSA Download Failed', status: 400 };
    }
};

const downloadDnaAgreement = async (merchantId, payload) => {
    try {
        const axios = Axios.create();
        const agreementDto = {
            fileName: `dna_merchant_agreement_${merchantId}.pdf`,
            fileType: 'application/pdf'
        };

        const awsPresignedUrl = await msaPreSignedUrlPut(merchantId, agreementDto);
        let config = {
            method: 'put',
            url: awsPresignedUrl.presignedUrl,
            data: payload,
            headers: {
                'Content-type': 'application/pdf'
            }
        };
        await axios(config);
        const querySeparator = awsPresignedUrl.presignedUrl.lastIndexOf('?Content-Type');
        const docLink = awsPresignedUrl.presignedUrl.substring(0, querySeparator);
        if (docLink) {
            const acquirerInfo = await acquirerRepo.findOne({
                where: {
                    name: 'DNA'
                }
            });
            const entity = TermsAndConditionEntityMap.ACQUIRER_AGREEMENT;
            const entityId = acquirerInfo.id;
            const documentId = awsPresignedUrl.documentId;
            const msadocumentDto = {
                link: docLink,
                linkType: 'pdf',
                id: documentId,
                status: 'active',
                merchantId: merchantId
            };
            await termsAndConditionsService.saveTermsAndConditions(entity, entityId, documentId, msadocumentDto);
            return response({}, 201);
        } else {
            return 'Document Not Uploaded to S3Bucket';
        }
    } catch (error) {
        console.error(error);
        return response({}, 500);
    }
};

export const submitDnaAgreement = async (
    existingPdfImageBuffer,
    dnaApplicationId,
    authtoken,
    ownerDetails,
    currentDate,
    msaFile
) => {
    try {
        const OwnerName = ownerDetails.fullName.split(' ');
        const axios = Axios.create();
        const form = new FormData();
        const OwnerFirstName = OwnerName[0];
        const OwnerSurName = OwnerName[2] ? OwnerName[2] : ' ';
        const OwnerEmail = ownerDetails.email;
        const OwnerSignDate = currentDate.toString();
        if (!fs.existsSync(`${tmpDirPath}/dna_msa_docs`)) {
            fs.mkdirSync(`${tmpDirPath}/dna_msa_docs`);
        }
        fs.writeFileSync(`${tmpDirPath}/dna_msa_docs/${msaFile}`, existingPdfImageBuffer);
        form.append('firstName', OwnerFirstName);
        form.append('surname', OwnerSurName);
        form.append('email', OwnerEmail);
        form.append('signDate', OwnerSignDate);
        form.append('file', fs.createReadStream(`${tmpDirPath}/dna_msa_docs/${msaFile}`), 'signed_dna_agreement.pdf');
        const response = await axios.post(
            `${DNA_API_URL}/${dnaApplicationId}/msa-upload`,
            form,

            {
                headers: {
                    Authorization: `Bearer ${authtoken}`,
                    ...form.getHeaders()
                }
            }
        );
        if (response.status === 200 && response.data.message === 'Success') {
            return { message: 'Successfully Accepted DNA Terms & Conditions', status: 200 };
        }
    } catch (error) {
        console.log('error in Agreement Download', error);
    }
};

const msaPreSignedUrlPut = async (merchantId, dto) => {
    const newDocumentId = flakeGenerateDecimal();
    const documentId = dto.pdfDocumentId ? dto.pdfDocumentId : newDocumentId.toString();
    const s3Params = {
        Bucket: bucket,
        Key: `dna-msa-docs/${merchantId}/${documentId}/${dto.fileName}`,
        Expires: EXPIRE_TIME_SECONDS,
        ContentType: dto.fileType,
        ACL: 'public-read'
    };

    const presignedUrl = await s3Client.getSignedUrlPromise('putObject', s3Params);
    return { documentId, presignedUrl };
};
